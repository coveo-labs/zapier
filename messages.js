'use strict';

//A nice place to store certain error messages that would reoccur. Can easily add to this later on
//if there's more types of errors that need to be handled frequently.
const messages = {
  BIG_FILE: 'File contents are too large. Limit is 100 MB.',
  TOO_MANY_FILES: 'The maximum number of files that can be sent is 50. Please reduce the number of files and try again.',
  BAD_FETCH: 'Fetching the file content failed or a bad url was given in the File input field and no plain text content was supplied. Please check your File field input and try again.',
  UNSUPPORTED_TAR: 'The tar compression types tar.Z, .tar.lzma, and .tar.xz (as well as their short-hands) are currently not supported. Use .tar.gz (.tgz), .tar.bz2 (.tbz2), or .tar instead.',
  BAD_TAR: 'The tar file you supplied either is corrupt, uses and unsupported tar compression, or is missing the tar header. Please check the file and supported compression, then try again.',
  NO_ORGS: 'You do not have access to any organizations in this account. Please gain access to an organization and try again.',
  NO_PUSH_SOURCES: 'You do not have any PUSH sources in the organization you have selected. Please create a PUSH source first and try again.',
  NO_FIELDS: 'Your organization has no fields on it. Please create at least one field in your organization and try again.',
};

module.exports =  messages;
