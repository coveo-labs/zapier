'use strict';

const push = require('./config').PUSH;
const messages = require('./messages');
const path = require('path');
const fileType = require('file-type');
const mime = require('mime-types');

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

//This function is to allow for types of archive files to be used for batch like push. Includes .zip, .tar, .tar.gz, or .tar.bz2 (and their short hands).
//This can be expanded upon in the future, but encompassing all archive file types would be very labor intensive.
const decompressBatch = details => {
  let addOrUpdate = [];

  //This is all for decompressing the contents of the files See: https://www.npmjs.com/package/decompress
  const decompress = require('decompress'); //Look for alternative for getting all of the contents of all tar file types and zip file, as of now there are no good decompression modules from a buffer, only local files

  //Decompress and get the contents of the supported archive file.
  //This will fail if a tar header is corrupt or not present and zip will always succeed unless corrupt.
  //Supports .zip, .bz2, .gz, and .tar (decompress module for tar files doesn't support .Z and .xz/.lzma/.lz is currently bugged).
  const toConvert = decompress(details.content, {
    inputFile: details.content,
  });

  return toConvert.then(files => {
    //Keep track of the total files and size in case they
    //go over the app limit. Also, set up method for storing
    //and folder names.
    let fileCount = 0;
    let folderNames = [];
    let totalFileSize = 0;

    //Loop through the file contents and grab the important
    //file components.
    files.forEach(file => {
      let zipContent = {};

      //These files are macOS dependent or hidden files that don't have any valuable content to extract, so ignore them.
      //Generally better not to expose hidden files in the source as well.
      if (file.path.indexOf('__MACOSX/') > -1 || ((/(^|\/)\.[^\/\.]/g).test(file.path.split('/').pop()))) {
        //Also ignore folders within the archive, just want their contents not the folders themselves, but keep folder names
        //to help alter the file names within them.
      } else if (file.type === 'directory') {
        folderNames.unshift(file.path);
      } else {
        let type = fileType(file.data); //To get the extension/file type

        //If the type wasn't found within file-type, try mime-types. If it did
        //work, the extension can be found. If mime-types succeeded where file-type
        //failed, get the extension from there. 
        if(type === null){

          let mimeType = mime.lookup(file.path);
          zipContent.contentType = '.' + mime.extension(mimeType);

        } else {
          zipContent.contentType = '.' + type.ext;
        }

        //Get important file info from each file in the archive
        zipContent.size = getStringByteSize(file.data);
        zipContent.content = file.data;
        zipContent.filename = file.path;
        fileCount++;
        totalFileSize += zipContent.size;

        //Too many files or the contents of the archive
        //are too big, so catch early and throw an error
        if (fileCount > 50) {
          throw new Error(messages.TOO_MANY_FILES);
        } else if (totalFileSize > 100 * 1024 * 1024){
          throw new Error(messages.BIG_FILE);
        }

        //If a file is in a folder, the file name includes the folder's name
        //as well. This looks at the encountered folders so far and removes
        //the excess folder name out of the file name.
        folderNames.forEach(folderName => {
          if (zipContent.filename.indexOf(folderName) > -1) {
            zipContent.filename = file.path.substr(folderName.length, file.path.length);
          }
        });
        
        //If both the mime-type checker and file-type checkers failed to get anything from the
        //file, try one last time on the file name if an extension if present.
        if(zipContent.contentType === '.false'){
          zipContent.contentType = path.extname(zipContent.filename);
        } 
        
        //If no extension or file type is found, and all checkers failed, default to nothing.
        if (zipContent.contentType === null || zipContent.contentType === undefined || zipContent.contentType === '') {
          zipContent.contentType = '';
        }

        //Get the compression type of the individual file in the zip file
        zipContent.compressionType = findCompressionType(zipContent, zipContent.size);

        //Push the file information into the array to be handled later
        addOrUpdate.push(zipContent);

      }
    });

    return addOrUpdate;
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

  //If can't find the file type, set the contents to null as well, this avoids errors
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

//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url for files, or urls in general).
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If a supported archive
//file is sent for batch pushing, see decompressBatch.
const fetchFile = url => {
  const fetch = require('node-fetch');
  const contentDisposition = require('content-disposition');

  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };


  return fetch(url)
    .then(response => {

      //If the url given is redirected to another place, doesn't match the given url, or contains link, the given file url
      //wasn't the url content was extracted from. So, throw the bad fetch error.
      if ((response.headers.get('link') || response.url != url || response.headers.get('www-authenticate'))) {
        throw new Error(messages.BAD_FETCH);
      }

      details.size = response.headers.get('content-length');
      details.contentType = '.' + mime.extension(response.headers.get('content-type'));
      const disposition = response.headers.get('content-disposition');

      //The file is too big (100 MB for now), throw an error telling
      //the user so and the file size limit.
      if (details.size >= 100 * 1024 * 1024) {
        throw new Error(messages.BIG_FILE);
      }

      //If disposition exists, makes getting this file info very easy/possible like this
      if (disposition) {
        details.filename = contentDisposition.parse(disposition).parameters.filename;
      }

      //This is a fabricated file extension from fetch if none is provided,
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

      // Using short names like 'c' and 'len' to improve readability in this case.
      const c = details.content;
      const len = c.length;
      const type = details.contentType;
      const name = details.filename;

      //Zip file, send to handleZip to get content. This helps to detect compression/file types based upon bytes in the data buffer for the
      //following conditional chain: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
      if ((c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05)) || type === '.zip') {
        
        return decompressBatch(details);

        //These are the bad tar types, throwing errors could break the app if the user doesn't realize the tar types they send are bad. So, instead of throwing an error,
        //do nothing, index the file with no extraction, and let the user look at their logs to see why things are going wrong.
        //Fetch gets lzma/xz tar files as an octet-stream, which mime-types defaults to .bin. So, check for type .bin as well as the normal extensions to avoid that tar.
      } else if((c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00 && (name.indexOf('.txz') > 0 || type === '.tar' || type === '.bin')) || (c[0] === 0x1f && c[1] === 0x9d && (type === '.tar' || type === '.Z' || name.indexOf('.Z') > 0)) || ((name.indexOf('.lzma') > 0 && type === '.tar' || type === '.bin') || (name.indexOf('.tlz') > 0 && type === '.tar' || type === '.bin') || (name.indexOf('.lz') > 0 && type === '.tar' || type === '.bin'))){
        //This tests to see if tar file sent or any possible tar file compression type was sent that are supported. Compressions for tar that are supported include: gzip, bz2, and normal tar.
        //This case is after zip and bad tars to avoid any bad tars from slipping by for the last case of the conditional, is the file just a tar with no compressions, despite this
        //calling the same function as the zip conditional. 
      } else if (((c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) && (type === '.tar' || name.indexOf('.tgz') > 0)) || (c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68 && (name.indexOf('.tbz2') > 0 || name.indexOf('.tbz') > 0 || name.indexOf('.tb2') > 0 || type === '.tar')) || type === '.tar'){
        
        return decompressBatch(details);

      }

      //If neither the zip or tar cases picked up anything, this is some single file
      //type, like pdf, or a file type that isn't supported (in which no valuable content will be extracted in the source)
      //and Coveo may or may not delete the submission.
      return details;
    });
};

//Get the size of a buffer if a size wasn't given in the file description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');

module.exports = {
  fetchFile,
  findCompressionType,
  handleError,
  getStringByteSize,
  setSourceStatus,
};
