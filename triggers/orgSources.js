'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

const triggerUtils = require('./utils');


// This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
// without the trigger actually showing up in the app. This allows the creation of dynamic drop downs for the input users
// can use to get choices instead of manually inputting some information. This specific function
// gets the possible push sources that are in the specified org, puts the source id in the input value, and displays the source name as in a readable format.
const perform = (z, bundle) => {
  // No org ID selected yet, so throw an error
  if (!bundle.inputData.orgId) {
    throw new Error(message.SELECT_ORG);
  }

  // getSources
  const sourcesRequest = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources`,
    method: 'GET',
  });

  // getPrivileges
  const privilegesRequest = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/members/privileges`,
    method: 'GET',
  });

  let p = Promise.all([sourcesRequest, privilegesRequest])
    .then(([sourcesResponse, privilegesResponse]) => {

      let sources = z.JSON.parse(sourcesResponse.content);
      let privileges = z.JSON.parse(privilegesResponse.content);

      if (sourcesResponse.status >= 400) {
        throw new Error('Error getting source choices for the drop down: ' + sources.message + ' Error Code: ' + sourcesResponse.status);
      }
      if (privilegesResponse.status >= 400) {
        throw new Error('Error getting privileges: ' + privileges.message + ' Error Code: ' + privilegesResponse.status);
      }

      sources = triggerUtils.filterSourcesWithPrivileges(sources, privileges);

      // Check if the selected organization has any push sources in it, if not throw an error.
      if (!sources.length) {
        throw new Error(message.NO_PUSH_SOURCES);
      }

      return sources;
    })
    .catch(handleError);

  return p;
};

module.exports = {
  key: 'orgSources',
  noun: 'Sources',

  display: {
    label: 'List of Sources',
    description: 'Hidden trigger in the app responsible for dynamic drop down',
    hidden: true, // Makes the trigger hidden. Don't remove.
  },

  operation: {
    perform,
    canPaginate: true, // In case the number of results is very high, allows for the results to be displayed in pages
  },
};
