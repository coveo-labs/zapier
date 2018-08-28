'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actually showing up in the app. This allows the creation of dynamic drop downs for the input users
//can use to get choices instead of manually inputting some information. This specific function
//gets the possible push sources that are in the specified org, puts the source id in the input value, and displays the source name as in a readable format.
const perform = (z, bundle) => {

  //No org ID selected yet, so throw an error
  if(!bundle.inputData.orgId){
    throw new Error(message.SELECT_ORG);
  }

  //Request to Coveo
  const orgSourcesPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources`,
    method: 'GET',
  });

  //Handle response
  return orgSourcesPromise
    .then(response => {
      if (response.status >= 400) {
        throw new Error(
          'Error getting source choices for the drop down: ' +
            z.JSON.parse(response.content).message +
            ' Error Code: ' +
            response.status
        );
      }

      let results = z.JSON.parse(response.content);
      if (!results.map) {
        // make sure it's an array
        results = [];
      }

      // We can only use this app with Push sources.
      results = results.filter(source => source.sourceType === 'PUSH');
      // Only want source ids and names from this call
      results = results.map(source => ({ id: source.id, name: source.name }));

      //Check if the selected organization has any push sources
      //in it, if not throw an error.
      if (!results.length) {
        throw new Error(message.NO_PUSH_SOURCES);
      }

      return results;
    })
    .catch(handleError);
};

module.exports = {
  key: 'orgSources',
  noun: 'Sources',

  display: {
    label: 'List of Sources',
    description: 'Hidden trigger in the app responsible for dynamic drop down',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation: {
    perform,
    canPaginate: true, //In case the number of results is very high, allows for the results to be displayed in pages
  },
};
