'use strict';

//A nice place to store certain error messages that would reoccur. Can easily add to this later on
//if there's more types of errors that need to be handled frequently.
const messages = {
  BIG_FILE: 'File contents are too large. Limit is 100 MB.',
  TOO_MANY_FILES: 'The maximum number of files that can be sent in a zip file is 50. Please reduce the number of files in the zip file and try again.',
  BAD_FETCH: 'Fetching the file content failed or a bad url was given in the File input field. Please check your File field input and try again.',
};

module.exports =  messages;
