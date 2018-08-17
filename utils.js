'use strict';

const push = require('./config').PUSH;
const messages = require('./messages');
const path = require('path');
const fileType = require('file-type');
const mime = require('mime-types');


//Get the size of a buffer if a size wasn't given in the file description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');


//Simple function to handle an error occurring in a function that wasn't explicitly caught.
const handleError = error => {
  if (typeof error === 'string') {
    throw new Error('Error occurred during processing: ' + error);
  }
  throw error;
};


//This function sends a request to update the status of the source in the organization
//before and after a push/delete request is made.
const setSourceStatus = (z, bundle, status) => {

  //Send request to Coveo
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/status`,
    method: 'POST',
    params: {
      statusType: status,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  //Return and handle response
  return promise
    .then(response => {
      if (response.status !== 201) {
        throw new Error('Error occurred updating the source status: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
      }
    });
};


//This is a function to determine the type of compression used on a file. If none of these are detected, it will be indexed with the default of UNCOMPRESSED.
//Used this as a reference: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe for compression detecting as
//well as documents about the file format headers for these types of compressions.
const findCompressionType = (zipContent, uncompressedSize) => {

  //Default
  let compressionType = 'UNCOMPRESSED';

  //Check file type only from the buffer, as file names can be unreliable
  const c = zipContent.content;
  let type = fileType(c);

  //If can't find the file type, set the contents to null as well just to avoid errors
  if(type === null){
    type = {
      ext: 'null',
      mime: 'null',
    };
  }

  //Check first few bytes of the buffer to get compression, except LZMA
  //as the structure for these isn't very consistent globally to check for each time
  //and is very taxing to determine without a handy module.
  if (c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08 || type.ext === 'gz' || type.mime === 'application/gzip') {
    compressionType = 'GZIP';
  } else if (c[0] === 0x78 && (c[1] === 1 || c[1] === 0x9c || c[1] === 0xda)){
    compressionType = 'DEFLATE';
  } else if (zipContent.size === uncompressedSize) {
    compressionType = 'UNCOMPRESSED';
  } else if (((c[0] * 256 + c[1]) % 31 === 0) && c[0] !== 0x00 && c[1] !== 0x00) {
    compressionType = 'ZLIB';
  }  else if (zipContent.filename.indexOf('.lzma') > 0 || zipContent.filename.indexOf('.lz') > 0 || type.ext === 'lz' || type.mime === 'x-lzip') { //lz shares LZMA compression, so checking for these is the same as lzma
    compressionType = 'LZMA';
  }

  return compressionType;
};


//This function handles the process of fetching all the files provided
//in the Field input field. All files will have content extracted, if they don't
//violate absolute url form or have content, and then indexed into the source.
const fileHandler = (files, bundle) => {

  //List of promises, content of all the files, total files, and 
  //and index tracker for updating the bundle for better response content later on.
  let promises = [];
  let fileContents = [];
  let fileCount = 0;
  let indexCount = -1;

  //Set up promises to fetch each file supplied
  files.forEach(file => {
    promises.push(fetchFile(file));
  });

  //Return all the promises
  return Promise.all(promises)
    .then(function(fileContent){

      //For each result of the fetch...
      fileContent.forEach(content => {

        //Get the file name and type, iterate index once.
        let filename = decodeURI(content.filename); //Fixes bug where some apps encode file names
        let fileType = 'A(n) ' + content.contentType;
        indexCount++;

        //If an archive file was fetched, do this
        if(content.length && !content.fetch){

          //Update the filename and type to be more response friendly for later
          filename = 'Contents of ' + decodeURI(content.originalFileInfo.filename);
          fileType = 'Contents of a ' + content.originalFileInfo.fileType;

          //For each file in the archive file
          content.forEach(subContent => {

            //Save the file info and iterate the file count 
            fileContents.push(subContent);
            fileCount++;

            //Too many files checker
            if(fileCount > 50){
              throw new Error(messages.TOO_MANY_FILES);
            }

          });

        //If a non-archive file is being looked at
        } else if (!content.fetch){

          //Get the content of the file and iterate the file count
          fileContents.push(content);
          fileCount++;

          //Too many files checker
          if(fileCount > 50){
            throw new Error(messages.TOO_MANY_FILES);
          }

        }
      
        //If the content fetched was bad (not the initial desired content)
        if (content.fetch){

          //Remove the content from the data, as it isn't important or useful
          bundle.inputData.content.splice(indexCount, 1);
          indexCount--;

          //If a good fetch happened
        } else if (content.length){

          //If the file name existed in the file information, set the
          //filename to be more response friendly, same for file type.
          //This is for archive files only.
          if(filename !== 'Content of '){
            bundle.inputData.content[indexCount] = filename;
          } else if (fileType !== 'Contents of a '){
            bundle.inputData.content[indexCount] = fileType + ' file';
          } else {
            bundle.inputData.content[indexCount] = 'A file';
          }

        } else {

          //If the file name existed in the file information, set the
          //filename to be more response friendly, same for file type.
          //This is for non-archive files only.
          if(filename !== ''){
            bundle.inputData.content[indexCount] = filename;
          } else if(fileType != 'A(n) '){
            bundle.inputData.content[indexCount] = fileType + ' file';
          } else {
            bundle.inputData.content[indexCount] = 'A file';
          }

        }

      });

      return fileContents;
    });

};


//This function is to allow for types of archive files to be used in a push. Includes .zip, .tar, .tar.gz, or .tar.bz2 (and their short hands).
//This can be expanded upon in the future, but encompassing all archive file types would be very labor intensive.
const decompressArchive = details => {
  let addOrUpdate = [];

  //This is all for decompressing the contents of the supported archive files See: https://www.npmjs.com/package/decompress
  const decompress = require('decompress'); 

  //Decompress and get the contents of the supported archive file types.
  //This will fail if a tar header is corrupt or not present and zip will always succeed unless corrupt.
  const toConvert = decompress(details.content, {
    inputFile: details.content,
  });

  return toConvert.then(files => {
    //Keep track of the total files and size  
    //Also, set up method for storing and folder names.
    let fileCount = 0;
    let folderNames = [];
    let totalFileSize = 0;

    //Loop through the file contents and grab the important components.
    files.forEach(file => {
      let archiveContent = {};

      //These files are macOS dependent or hidden files that don't have any valuable content to extract, so ignore them.
      if (file.path.indexOf('__MACOSX/') > -1 || ((/(^|\/)\.[^\/\.]/g).test(file.path.split('/').pop()))) {
        //Also ignore folders within the archive, but keep folder names
        //to help alter the file names within them.
      } else if (file.type === 'directory') {
        folderNames.unshift(file.path);
      } else {
        let type = fileType(file.data); //To get the extension/file type

        //If file-type didn't find anything, try mime-types.
        //If mime-types succeeded where file-type failed, get the extension from there. 
        if(type === null){

          let mimeType = mime.lookup(file.path);
          archiveContent.contentType = '.' + mime.extension(mimeType);

        } else {
          archiveContent.contentType = '.' + type.ext;
        }

        //If both the mime-type checker and file-type checkers failed to get anything from the
        //file, try one last time on the file name if an extension if present.
        if(archiveContent.contentType === '.false'){
          archiveContent.contentType = path.extname(archiveContent.filename);
        } 
        //If no extension or file type is found, and all checkers failed, default to nothing.
        else if (archiveContent.contentType === null || archiveContent.contentType === undefined || archiveContent.contentType === '') {
          archiveContent.contentType = '';
        }

        //Get important file info from each file in the archive
        archiveContent.size = getStringByteSize(file.data);
        archiveContent.content = file.data;
        archiveContent.filename = file.path;
        totalFileSize += archiveContent.size;
        fileCount++;

        //Too many files or the contents of the archive
        //are too big, so catch early and throw an error
        if (fileCount > 50) {
          throw new Error(messages.TOO_MANY_FILES);
        } else if (totalFileSize > 100 * 1024 * 1024){
          throw new Error(messages.BIG_FILE);
        }

        //If a file is in a folder, the file name includes the folder's name
        //as well. Remove the excess folder name out of the file name.
        folderNames.forEach(folderName => {
          if (archiveContent.filename.indexOf(folderName) > -1) {
            archiveContent.filename = file.path.substr(folderName.length, file.path.length);
          }
        });

        //Get the compression type of the individual file in the zip file
        archiveContent.compressionType = findCompressionType(archiveContent, archiveContent.size);

        //Push the file information into the array to be handled later
        addOrUpdate.push(archiveContent);

      }
    });

    //Save the original file type for the sake of output and return
    addOrUpdate.originalFileInfo = details;
    return addOrUpdate;
  });
};


//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url for files, or urls in general).
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If a supported archive
//file is sent for batch pushing, see decompressArchive.
const fetchFile = url => {
  const fetch = require('node-fetch');
  const contentDisposition = require('content-disposition');
  const lowerCase = require('lower-case');

  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };

  //If the url is not absolute, fetch will fail. Prevent the error here
  //and from breaking the Zap by just not fetching any content from it
  if(url.indexOf('http') !== 0 || url.indexOf('https') !== 0){
    
    details.fetch = 'bad url';
    return details;

  } else {

    return fetch(url)
      .then(response => {

        // If the url given is redirected to another place, doesn't match the given url, or contains link, the given file url
        // wasn't the url content was extracted from. So, throw the bad fetch error.
        if ((response.headers.get('link') || lowerCase(url) !== lowerCase(response.url) || response.headers.get('www-authenticate'))) {
          details.fetch = 'bad fetch';
        }

        details.size = response.headers.get('content-length');
        details.contentType = '.' + mime.extension(response.headers.get('content-type'));
        const disposition = response.headers.get('content-disposition');

        //If disposition exists, makes getting this file info very easy/possible like this.
        //If the file extraction is a temporary amazon bucket, .parse() breaks. So, just use split
        //for the filename if this happens
        if (disposition && response.headers.get('x-amz-server-side-encryption')) {
          details.filename = disposition.split('\'\'')[1];
        } else if (disposition) {
          details.filename = contentDisposition.parse(disposition).parameters.filename;
        }

        //This is a fabricated file extension from fetch if none is found,
        //just get rid of it as it confuses indexing and the title.
        if(details.filename.split('.').pop() === 'obj'){
          details.filename = details.filename.substr(0, details.filename.lastIndexOf('.'));
        }

        //If mime-type couldn't pick up an extension, try file-type to get it
        //based on the data buffer
        if (details.contentType === '.false') {
          if(fileType(details.content) === null){ //Bad call, do nothing
          } else {
            details.contentType = '.' + fileType(details.content).ext;
          }
        } 

        //If mime-type and file-type fail, last resort is the file name for an extension.
        if(details.contentType === '.false'){
          details.contentType = path.extname(details.filename);
        } 

        //If no extension or file type is found, and all checkers failed, default to nothing.
        if (details.contentType === null || details.contentType === undefined || details.contentType === '') {
          details.contentType = '';
        }

        //Return the promise/buffer of the file
        return response.buffer();
      })
      .then(content => {
        details.content = content;

        //Get a size if the response of fetch failed to find it
        if(details.size === 'null'){
          details.size = getStringByteSize(content);
        }

        //The file is too big (100 MB for now), throw an error telling
        //the user so and the file size limit.
        if (details.size >= 100 * 1024 * 1024) {
          throw new Error(messages.BIG_FILE);
        }

        // Using short names like 'c' and 'len' to improve readability in this case.
        const c = details.content;
        const len = c.length;
        const type = details.contentType;
        const name = details.filename;

        //Zip file, send to handleZip to get content. This helps to detect compression/file types based upon bytes in the data buffer for the
        //following conditional chain: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
        if ((c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05)) || type === '.zip') {
        
          return decompressArchive(details);

        //These are the bad tar types, throwing errors could break the app if the user doesn't realize the tar types they send are bad. So, instead of throwing an error,
        //do nothing, index the file with no extraction, and let the user look at their logs to see why things are going wrong.
        //Fetch gets lzma/xz tar files as an octet-stream, which mime-types defaults to .bin. So, check for type .bin as well as the normal extensions to avoid that tar.
        } else if((c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00 && (name.indexOf('.txz') > 0 || type === '.tar' || type === '.bin')) || (c[0] === 0x1f && c[1] === 0x9d && (type === '.tar' || type === '.Z' || name.indexOf('.Z') > 0)) || ((name.indexOf('.lzma') > 0 && type === '.tar' || type === '.bin') || (name.indexOf('.tlz') > 0 && type === '.tar' || type === '.bin') || (name.indexOf('.lz') > 0 && type === '.tar' || type === '.bin'))){
        //This tests to see if tar file sent or any possible tar file compression type was sent that are supported. Compressions for tar that are supported include: gzip, bz2, and normal tar.
        //This case is after zip and bad tars to avoid any bad tars from slipping by for the last case of the conditional, is the file just a tar with no compressions, despite this
        //calling the same function as the zip conditional. 
        } else if (((c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) && (type === '.tar' || name.indexOf('.tgz') > 0)) || (c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68 && (name.indexOf('.tbz2') > 0 || name.indexOf('.tbz') > 0 || name.indexOf('.tb2') > 0 || type === '.tar' || type === '.bz2')) || type === '.tar'){
        
          return decompressArchive(details);

        }

        //If neither the zip or tar cases picked up anything, this is some single file
        //type, like pdf, or a file type that isn't supported (in which no valuable content will be extracted in the source)
        //and Coveo may or may not delete the submission.
        return details;
      });
  }
};

module.exports = {
  getStringByteSize,
  handleError,
  setSourceStatus,
  findCompressionType,
  fileHandler,
};
