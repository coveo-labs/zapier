'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic drop downs for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the possible push sources that are in the specified org, puts the source id in the input value, and displays the source name as in readable format.
const perform = (z, bundle) => {
  //Request to Coveo to get fields that specified source uses in it's mappings. Org ID must be
  //given by the user beforehand for this to work.
  const orgSourcesPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources`,
    method: 'GET',
  });

  //Handle response
  return orgSourcesPromise
    .then(response => {
      if (response.status >= 400) {
        throw new Error(
          'Error getting source choices for the drop down. Please ensure the organization ID has been selected already and try again: ' +
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
