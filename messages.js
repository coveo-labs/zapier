'use strict';

//A nice place to store certain error messages that would reoccur. Can easily add to this later on
//if there's more types of errors that need to be handled frequently.
const messages = {
  BIG_FILE: 'The supplied file contents are too large. Limit is 100 MB. Please reduce the file size or try a smaller file.',
  TOO_MANY_FILES: 'The maximum number of files that can be sent is 50. Please reduce the number of files and try again.',
  NO_ORGS: 'You do not have access to any organizations in this account. Please gain access to an organization and try again.',
  NO_PUSH_SOURCES: 'You do not have any PUSH sources in the organization you have selected. Please create a PUSH source first and try again.',
  NO_FIELDS: 'Your organization has no fields on it. Please create at least one field in your organization and try again.', //Not used, but can be in the future, so keep it
  SELECT_ORG: 'You must choose an organization ID before you choose a source ID. Please choose an organization ID first and try again',
  SELECT_ORG_AND_SOURCE: 'You must choose and organization ID and source ID before you can get a list of fields. Please choose you organization and source IDs first and try again.',
};

module.exports =  messages;
