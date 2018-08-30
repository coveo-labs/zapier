'use strict';

const platform = require('../config').PLATFORM;
const utils = require('../utils');

// This functions handles the query call to Coveo, then sends off the result to the output handler.
const handleQuery = (z, bundle) => {
  let token = bundle.authData.access_token;

  // Default to help documents org if needed and for publicQuery action.
  if (!bundle.inputData.organizationId) {
    bundle.inputData.organizationId = 'coveosearch';
    token = process.env.SEARCH_TOKEN; // we use a specific token for that organization
  }

  // Construct query call to Coveo
  const orgQueryPromise = z.request({
    url: `https://${platform}/rest/search/v2/`,
    method: 'GET',
    params: bundle.inputData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });

  // Handle response info
  return orgQueryPromise
    .then(response => {
      // Handle errors that can occur
      if (response.status !== 200) {
        utils.coveoErrorHandler(response.status);
      }

      // Get the important parts of the response that we want
      let results = z.JSON.parse(response.content).results;

      // return the first element only or empty array
      let retval = [];
      if (results && results.length) {
        retval.push(results[0]);
      }

      // Send to output handler
      return retval;
    })
    .catch(utils.handleError);
};

module.exports = {
  handleQuery,
};
