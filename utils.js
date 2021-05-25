'use strict';

const push = require('./config').PUSH;
const messages = require('./messages');
const FileType = require('file-type');

// Get the size of a buffer if a size wasn't given in the file description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');

// Simple function to handle an error occurring in a function that wasn't explicitly caught.
const handleError = error => {
  if (typeof error === 'string') {
    throw new Error('Error occurred during processing: ' + error);
  }
  throw error;
};

// Function to handle the logic of all Coveo errors that can occur
// to make them more user friendly and sorted.
const coveoErrorHandler = status => {
  let errorMessage = messages['ERROR_' + status]; // find error by status code
  if (!errorMessage) {
    if (status >= 500 || status === 415 || status === 404) {
      errorMessage = messages.SHOULD_NOT_OCCUR_ERRORS;
    }
  }

  throw new Error(errorMessage || messages.FALLBACK_ERROR);
};

// function to check whether or not the url given for the fetch is absolute or the fetch got bad content.
const validateFetch = (url, fetchResponse) => {
  let fetch = true;

  // Absolute url format checker
  if (url.indexOf('http') !== 0) {
    fetch = false;
  } else if (fetchResponse) {
    // If the url given is redirected to another place, doesn't match the given url, or contains link, the given file url
    // wasn't the url content was extracted from. So, throw the bad fetch error.
    if (fetchResponse.headers.link || url.toLowerCase() !== fetchResponse.url.toLowerCase() || fetchResponse.headers['www-authenticate']) {
      fetch = false;
    }
  }

  return fetch;
};

// Function to check if the total number of files processed exceeds 50.
const validateFileCount = fileCount => {
  if (fileCount > 50) {
    throw new Error(messages.TOO_MANY_FILES);
  }
  return false;
};

// Function to check if the file size or total size of the files fetched exceeds 100 MB.
// If no size can be fetched, find it from the buffer first, then check.
const validateFileSize = (fileSize, fileBuffer) => {
  if (fileSize === 'null' && fileBuffer) {
    fileSize = getStringByteSize(fileBuffer);
  }
  if (fileSize > 100 * 1024 * 1024) {
    throw new Error(messages.BIG_FILE);
  }
  return fileSize;
};

// Function for finding the filetype/extension of a file after it's contents have been fetched
const findExtension = async (file, response) => {
  const mime = require('mime-types');
  const path = require('path');
  let fileExtension = '';

  // If the filename is trying to be determined from node-fetch call, aka when a file is being looked at that isn't inside of an archive file
  if (response) {
    fileExtension = mime.extension(response.headers.get('content-type'));

    // If mime-type couldn't pick up an extension, try file-type to get it based on the data buffer
    if (!fileExtension) {
      fileExtension = ( await FileType.fromFile(file.content) || {}).ext;
    }

    // If mime-type and file-type fail, last resort is the file name for an extension.
    if (!fileExtension) {
      fileExtension = path.extname(file.filename);
    }

    // If no extension or file type is found, and all checkers failed, default to nothing.
    if (fileExtension) {
      fileExtension = '.' + fileExtension;
    }

    return fileExtension;

    // Files within archive files checker
  } else {
    let type = (await FileType.fromBuffer(file.data) || {}).ext; // To get the extension/file type

    // If file-type didn't find anything, try mime-types.
    // If mime-types succeeded where file-type failed, get the extension from there.
    if (type === null) {
      let mimeType = mime.lookup(file.path);
      fileExtension = mime.extension(mimeType);
    } else {
      fileExtension = type.ext;
    }
    // If both the mime-type checker and file-type checkers failed to get anything from the
    // file, try one last time on the file name if an extension if present.
    if (!fileExtension) {
      fileExtension = path.extname(file.path);
    }
    // If no extension or file type is found, and all checkers failed, default to nothing.
    else if (fileExtension) {
      fileExtension = '.' + fileExtension;
    }

    return fileExtension;
  }
};

// Function to find the filename of a file after it's contents have been fetched.
const findFilename = (disposition, response) => {
  const contentDisposition = require('content-disposition');
  let filename = '';

  // If disposition exists, makes getting this file info very easy/possible like this.
  // If the file extraction is a temporary amazon bucket, .parse() breaks.
  // So, just use split for the filename if this happens
  if (disposition && response.headers.get('x-amz-server-side-encryption')) {
    filename = disposition.split(`''`)[1];
  } else if (disposition) {
    filename = contentDisposition.parse(disposition).parameters.filename;
  }

  // This is a fabricated file extension from fetch if none is found, just get rid of it as it confuses indexing and the title.
  if (filename.split('.').pop() === 'obj') {
    filename = filename.substr(0, filename.lastIndexOf('.'));
  }

  return filename;
};

// Function to filter out hidden files and macOS dependent files when scanning through the contents of an archive file.
const archiveFileNameFilter = (file, folderNames) => {
  // These files are macOS dependent or hidden files that don't have any valuable content to extract, so ignore them.
  if (file.path.indexOf('__MACOSX/') > -1 || /(^|\/)\.[^/.]/g.test(file.path.split('/').pop())) {
    return true;
    // Ignore folders as well, we just want files, but hold onto the
    // folder names to fix filenames within them
  } else if (file.type === 'directory') {
    folderNames.unshift(file.path);
    return true;
  }

  return false;
};

// see description in validateArchiveType
const isValidZip = (content, name, type) => {
  const c = content;
  const len = c.length;
  return (c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05)) || type === '.zip';
};

// see description in validateArchiveType
const isInvalidTar = (content, name, type) => {
  const c = content;
  const typeIsTar = type === '.tar';
  return (
    type === '.bin' ||
    (c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00 && (/\.(txz)$/i.test(name) || typeIsTar)) ||
    (c[0] === 0x1f && c[1] === 0x9d && (typeIsTar || type === '.Z' || /\.(Z)$/i.test(name))) ||
    (/\.(lzma)$/i.test(name) && typeIsTar) ||
    (/\.(tlz)$/i.test(name) && typeIsTar) ||
    (/\.(lz)$/i.test(name) && typeIsTar)
  );
};

// see description in validateArchiveType
const isValidTar = (content, name, type) => {
  const c = content;
  return (
    (c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08 && (type === '.tar' || /\.(tgz)$/i.test(name))) ||
    ((c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68 && /\.(tbz2)$/i.test(name)) || /\.(tbz)$/i.test(name) || /\.(tb2)$/i.test(name) || type === '.tar' || type === '.bz2') ||
    type === '.tar'
  );
};

// Function to detect if the file being observed is a supported archive
// filetype or not.
const validateArchiveType = details => {
  const type = details.contentType;
  const name = details.filename;
  let goodArchive = false;

  if (isValidZip(details.content, name, type)) {
    // Zip file supported archive type. This helps to detect compression/file types based upon bytes in the data buffer for the
    // following conditional chain: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
    goodArchive = true;
  } else if (isInvalidTar(details.content, name, type)) {
    // These are the bad tar types, throwing errors could break the app if the user doesn't realize the tar types they send are bad. So, instead of throwing an error,
    // do nothing, index the file with no extraction, and let the user look at their logs to see why things are going wrong.
    // Fetch gets lzma/xz tar files as an octet-stream, which mime-types defaults to .bin. So, check for type .bin as well as the normal extensions to avoid that tar.
  } else if (isValidTar(details.content, name, type)) {
    // This tests to see if tar file sent or any possible tar file compression type was sent that are supported. Compressions for tar that are supported include: gzip, bz2, and normal tar.
    // This case is after zip and bad tars to avoid any bad tars from slipping by for the last case of the conditional, is the file just a tar with no compressions, despite this
    // doing the same thing as the zip conditional.
    goodArchive = true;
  }

  return goodArchive;
};

// This function sends a request to update the status of the source in the organization before and after a push/delete request is made.
const setSourceStatus = (z, bundle, status) => {
  // Send request to Coveo
  const statePromise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.organizationId}/sources/${bundle.inputData.sourceId}/status`,
    method: 'POST',
    params: {
      statusType: status,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Return and handle response
  return statePromise.then(response => {
    if (response.status !== 201) {
      coveoErrorHandler(response.status);
    }
  });
};

// see description in validateCompressionType
const isCompressionGzip = (c, type) => {
  return (c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) || type.ext === 'gz' || type.mime === 'application/gzip';
};

// see description in validateCompressionType
const isCompressionDeflate = c => {
  return c[0] === 0x78 && (c[1] === 1 || c[1] === 0x9c || c[1] === 0xda);
};

// see description in validateCompressionType
const isCompressionZlib = c => {
  return (c[0] * 256 + c[1]) % 31 === 0 && c[0] !== 0x00 && c[1] !== 0x00;
};

// This is a function to determine the type of compression used on a file. If none of these are detected, it will be indexed with the default of UNCOMPRESSED.
// Used this as a reference: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe for compression detecting as
// well as documents about the file format headers for these types of compressions.
const validateCompressionType = async (zipContent, uncompressedSize) => {
  // Default
  let compressionType = 'UNCOMPRESSED';

  // Check file type only from the buffer, as file names can be unreliable
  const c = zipContent.content;
  let type = await FileType.fromBuffer(c);

  // If can't find the file type, set the contents to null as well just to avoid errors
  if (!type) {
    type = {
      ext: 'null',
      mime: 'null',
    };
  }

  // Check first few bytes of the buffer to get compression, except LZMA as the structure for these isn't very consistent globally
  // to check for each time and is very taxing to determine without a handy module.
  if (isCompressionGzip(c, type)) {
    compressionType = 'GZIP';
  } else if (isCompressionDeflate(c, type)) {
    compressionType = 'DEFLATE';
  } else if (zipContent.size === uncompressedSize) {
    compressionType = 'UNCOMPRESSED';
  } else if (isCompressionZlib(c)) {
    compressionType = 'ZLIB';
  } else if (/\.(lzma|lz)$/i.test(zipContent.filename) || type.ext === 'lz' || type.mime === 'x-lzip') {
    // lz shares LZMA compression, so checking for these is the same as lzma
    compressionType = 'LZMA';
  }

  return compressionType;
};

module.exports = {
  archiveFileNameFilter,
  coveoErrorHandler,
  findExtension,
  findFilename,
  getStringByteSize,
  handleError,
  setSourceStatus,
  validateArchiveType,
  validateCompressionType,
  validateFetch,
  validateFileCount,
  validateFileSize,
};
