'use strict';

const platform = require('../config').PLATFORM;
const utils = require('../utils');

// Remove duplicated and sys* fields fields from responses.
const cleanResult = response => {
  let cleanedResult = {};

  let keys = Object.keys(response); // get all keys
  keys = keys.sort((a, b) => a.localeCompare(b)); // sort them alphetically, lowercases will be first. for example: "alpha","beta","Beta","delta","Delta"...
  keys = keys.filter((k, i, a) => {
    // remove sysX if X exists on its own. (systitle/title)
    if (/^sys/.test(k) && a.includes(k.substr(3))) {
      return false;
    }
    // check if the previous key in the array is the same as the current one, if so, don't include this current key.
    return i === 0 || a[i - 1].toLocaleLowerCase().localeCompare(k.toLocaleLowerCase());
  });

  // For the filtered keys, copy their value
  keys.forEach(k=>{
    let v = response[k];
    if (v !== null && !(v instanceof Array && v.length === 0)) { // filter out null values and empty arrays
      cleanedResult[k] = response[k];
    }
  });

  // same procedure for the 'raw' values
  if (cleanedResult.raw) {
    cleanedResult.raw = cleanResult(cleanedResult.raw);
  }

  return cleanedResult;
};

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
        retval.push(cleanResult(results[0]));
      }

      // Send to output handler
      return retval;
    })
    .catch(utils.handleError);
};

module.exports = {
  cleanResult,
  handleQuery,
};
