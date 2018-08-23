'use strict';

//A nice place to store certain error messages that would reoccur. Can easily add to this later on
//if there's more types of errors that need to be handled frequently.
const messages = {
  BIG_FILE: 'The supplied file contents are too large. Limit is 100 MB. Please reduce the file size or try a smaller file.',
  TOO_MANY_FILES: 'The maximum number of files that can be sent is 50. Please reduce the number of files and try again.',
  NO_ORGS: 'You do not have access to any organizations in this account. Please gain access to an organization and try again.',
  NO_PUSH_SOURCES: 'You do not have any PUSH sources in the organization you have selected. Please create a PUSH source first and try again.',
  NO_FIELDS: 'Your organization has no fields on it. Please create at least one field in your organization and try again.', //Not used, but can be in the future
  SELECT_ORG: 'You must choose an Organization before you choose a Source. First choose an Organization and try again.',
  SELECT_ORG_AND_SOURCE: 'You must choose and organization ID and source ID before you can get a list of fields. Please choose you organization and source IDs first and try again.',
  ERROR_400: 'There was an error processing your request to Coveo. Ensure your inputs were correct and that the organization you are pushing to is not paused.',
  ERROR_401: 'There was an authentication issue during your request. Ensure your connected account is still working and try again.',
  ERROR_403: 'You do not have sufficient privileges to perform this request. Ensure the connected account has the necessary privileges to carry out the action and try again.',
  ERROR_412: 'There were incorrect or missing parameters sent with your request. Ensure all the required input fields are valid and try again.',
  ERROR_413: 'The search query you are sending is too large. Reduce the size of the search query and try again.',
  ERROR_429: 'You are attempting to send too many requests at a time. Wait a few minutes and try again.',
  SHOULD_NOT_OCCUR_ERRORS: 'There was an unexpected error with Coveo. If the error persists, contact Coveo Support.',
  FALLBACK_ERROR: 'There was an issue processing the request to Coveo. Ensure the connected account is working and your inputs are valid before trying again.',
};

module.exports =  messages;
