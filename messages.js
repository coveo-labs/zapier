'use strict';

//A nice place to store certain error messages that would reoccur. Can easily add to this later on
//if there's more types of errors that need to be handled frequently.
const messages = {
  BIG_FILE: 'File contents are too large. Limit is 100 MB.',
  TOO_MANY_FILES: 'The maximum number of files that can be sent in a batch is 50. Please reduce the number of files and try again.',
  BAD_FETCH: 'Fetching the file content failed or a bad url was given in the File input field. Please check your File field input and try again.',
  BAD_COMPRESSION: 'A file has an unsupported compression type. Compression types allowed include: deflate, gzip, zlib, LZMA, and uncompressed.',
  UNSUPPORTED: 'The tar compression types tar.Z, .tar.lzma, and .tar.xz (and their shorthands) are currently not supported.',
};

module.exports =  messages;
