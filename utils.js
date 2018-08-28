'use strict';

const push = require('./config').PUSH;
const messages = require('./messages');
const fileType = require('file-type');


//Get the size of a buffer if a size wasn't given in the file description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');


//Simple function to handle an error occurring in a function that wasn't explicitly caught.
const handleError = error => {
  if (typeof error === 'string') {
    throw new Error('Error occurred during processing: ' + error);
  }
  throw error;
};


//Function to handle the logic of all Coveo errors that can occur
//to make them more user friendly and sorted.
const coveoErrorHandler = status => {
  if(status === 400){
    throw new Error(messages.ERROR_400);
  } else if (status === 401){
    throw new Error(messages.ERROR_401);
  } else if (status === 403){
    throw new Error(messages.ERROR_403);
  } else if (status === 412){
    throw new Error(messages.ERROR_412);
  } else if (status === 413){
    throw new Error(messages.ERROR_413);
  } else if (status === 429){
    throw new Error(messages.ERROR_429);
  } else if (status >= 500 || status === 415 || status === 404){
    throw new Error(messages.SHOULD_NOT_OCCUR_ERRORS);
  } else {
    throw new Error(messages.FALLBACK_ERROR);
  }
};

//function to check whether or not the url given for the fetch
//is absolute or the fetch got bad content. 
const validateFetch = (url, fetchResponse) => {
  let fetch = true;

  //Absolute url format checker
  if(url.indexOf('http') !== 0){
    fetch = false;
  } else if (fetchResponse) {
    // If the url given is redirected to another place, doesn't match the given url, or contains link, the given file url
    // wasn't the url content was extracted from. So, throw the bad fetch error.
    if (fetchResponse.headers.link || url.toLowerCase() !== fetchResponse.url.toLowerCase() || fetchResponse.headers['www-authenticate']){
      fetch = false;
    }
  }

  return fetch;
};

//Function to check if the total number of files
//processed exceeds 50.
const validateFileCount = fileCount => {
  if(fileCount > 50){
    throw new Error(messages.TOO_MANY_FILES);
  }
  return false;
};


//Function to check if the file size or total size of the files
//fetched exceeds 100 MB. If no size can be fetched, find it from
//the buffer first, then check.
const validateFileSize = (fileSize, fileBuffer) => {
  if(fileSize === 'null' && fileBuffer){
    fileSize = getStringByteSize(fileBuffer);
  } 
  if(fileSize > 100 * 1024 * 1024){
    throw new Error(messages.BIG_FILE);
  }
  return fileSize;
};


//Function for finding the filetype/extension of a file after it's contents have been fetched
const findExtension = (file, response) => {
  const mime = require('mime-types');
  const path = require('path');
  let fileExtension = '';

  //If the filename is trying to be determined from node-fetch call, aka when
  //a file is being looked at that isn't inside of an archive file
  if(response){
    fileExtension = mime.extension(response.headers.get('content-type'));

    //If mime-type couldn't pick up an extension, try file-type to get it
    //based on the data buffer
    if (!fileExtension) {
      if(fileType(fileExtension) === null){ //Bad call, do nothing
      } else {
        fileExtension = fileType(file.content).ext;
      }
    } 
  
    //If mime-type and file-type fail, last resort is the file name for an extension.
    if(!fileExtension){
      fileExtension = path.extname(file.filename);
    } 
  
    //If no extension or file type is found, and all checkers failed, default to nothing.
    if (fileExtension) {
      fileExtension = '.' + fileExtension;
    }

    return fileExtension;

    //Files within archive files checker
  } else {

    let type = fileType(file.data); //To get the extension/file type
  
    //If file-type didn't find anything, try mime-types.
    //If mime-types succeeded where file-type failed, get the extension from there. 
    if(type === null){

      let mimeType = mime.lookup(file.path);
      fileExtension = mime.extension(mimeType);

    } else {
      fileExtension = type.ext;
    }
    //If both the mime-type checker and file-type checkers failed to get anything from the
    //file, try one last time on the file name if an extension if present.
    if(!fileExtension){
      fileExtension = path.extname(file.path);
    } 
    //If no extension or file type is found, and all checkers failed, default to nothing.
    else if (fileExtension) {
      fileExtension = '.' + fileExtension;
    }

    return fileExtension;
  }
};

//Function to find the filename of a file after it's contents have been fetched.
const findFilename = (disposition, response) => {
  const contentDisposition = require('content-disposition');
  let filename = '';

  //If disposition exists, makes getting this file info very easy/possible like this.
  //If the file extraction is a temporary amazon bucket, .parse() breaks. So, just use split
  //for the filename if this happens
  if (disposition && response.headers.get('x-amz-server-side-encryption')) {
    filename = disposition.split('\'\'')[1];
  } else if (disposition) {
    filename = contentDisposition.parse(disposition).parameters.filename;
  }
  
  //This is a fabricated file extension from fetch if none is found,
  //just get rid of it as it confuses indexing and the title.
  if(filename.split('.').pop() === 'obj'){
    filename = filename.substr(0, filename.lastIndexOf('.'));
  }

  return filename;
};


//Function to filter out hidden files and macOS dependent files when scanning through the contents
//of an archive file.
const archiveFileNameFilter = (file, folderNames) => {

  //These files are macOS dependent or hidden files that don't have any valuable content to extract, so ignore them.
  if (file.path.indexOf('__MACOSX/') > -1 || ((/(^|\/)\.[^\/\.]/g).test(file.path.split('/').pop()))) {
    return true;
    //Ignore folders as well, we just want files, but hold onto the
    //folder names to fix filenames within them
  } else if (file.type === 'directory'){
    folderNames.unshift(file.path);
    return true;
  }

  return false;
};


//Function to detect if the file being observed is a supported archive
//filetype or not.
const validateArchiveType = details => {

  const c = details.content;
  const len = c.length;
  const type = details.contentType;
  const name = details.filename;
  let goodArchive = false;

  //Zip file supported archive type. This helps to detect compression/file types based upon bytes in the data buffer for the
  //following conditional chain: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
  if ((c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05)) || type === '.zip') {
    goodArchive = true;

    //These are the bad tar types, throwing errors could break the app if the user doesn't realize the tar types they send are bad. So, instead of throwing an error,
    //do nothing, index the file with no extraction, and let the user look at their logs to see why things are going wrong.
    //Fetch gets lzma/xz tar files as an octet-stream, which mime-types defaults to .bin. So, check for type .bin as well as the normal extensions to avoid that tar.
  } else if(((c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00 && (((/\.(txz)$/i).test(name)) || type === '.tar' || type === '.bin'))) || (c[0] === 0x1f && c[1] === 0x9d && (type === '.tar' || type === '.Z' || ((/\.(Z)$/i).test(name)))) || (((/\.(lzma)$/i).test(name)) && type === '.tar' || type === '.bin') || (((/\.(tlz)$/i).test(name)) && type === '.tar' || type === '.bin') || (((/\.(lz)$/i).test(name)) && type === '.tar' || type === '.bin')){
  //This tests to see if tar file sent or any possible tar file compression type was sent that are supported. Compressions for tar that are supported include: gzip, bz2, and normal tar.
  //This case is after zip and bad tars to avoid any bad tars from slipping by for the last case of the conditional, is the file just a tar with no compressions, despite this
  //doing the same thing as the zip conditional. 
  } else if (((c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) && (type === '.tar' || ((/\.(tgz)$/i).test(name)))) || ((c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68 && ((/\.(tbz2)$/i).test(name)) || ((/\.(tbz)$/i).test(name)) || ((/\.(tb2)$/i).test(name)) || type === '.tar' || type === '.bz2')) || type === '.tar'){
    goodArchive = true;
  }

  return goodArchive;
};


//This function sends a request to update the status of the source in the organization
//before and after a push/delete request is made.
const setSourceStatus = (z, bundle, status) => {

  //Send request to Coveo
  const statePromise = z.request({
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
  return statePromise
    .then(response => {
      if (response.status !== 201) {
        coveoErrorHandler(response.status);
      }
    });
};


//This is a function to determine the type of compression used on a file. If none of these are detected, it will be indexed with the default of UNCOMPRESSED.
//Used this as a reference: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe for compression detecting as
//well as documents about the file format headers for these types of compressions.
const validateCompressionType = (zipContent, uncompressedSize) => {

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
  }  else if ((/\.(lzma|lz)$/i).test(zipContent.filename) || type.ext === 'lz' || type.mime === 'x-lzip') { //lz shares LZMA compression, so checking for these is the same as lzma
    compressionType = 'LZMA';
  }

  return compressionType;
};

module.exports = {
  getStringByteSize,
  handleError,
  coveoErrorHandler,
  validateFetch,
  validateFileCount,
  validateFileSize,
  findExtension,
  findFilename,
  archiveFileNameFilter,
  validateArchiveType,
  setSourceStatus,
  validateCompressionType,
};
