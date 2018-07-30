'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic drop downs for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the fields used by a specific source, fills the input value with the field name, and displays the field name in a readable format.
const perform = (z, bundle) => {

  //Request to Coveo to get fields that specified source uses in it's mappings. Source ID and Org ID must be
  //given by the user beforehand for this to work.
  const sourceFieldsPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/indexes/page/fields`,
    method: 'GET',
  });

  //Handle response
  return sourceFieldsPromise
    .then(response => {
      if (response.status >= 400) {
        throw new Error(
          'Error getting field choices for the drop down. Please ensure the source and organization IDs have been selected already: ' +
            z.JSON.parse(response.content).message +
            ' Error Code: ' +
            response.status
        );
      }

      let results = z.JSON.parse(response.content);
      results = results.items || [];
      if (!results.map) {
        // make sure it's an array
        results = [];
      }

      //Only want the ids and names of the fields from this call. If the field has
      //already been selected in another input box, ignore it, otherwise grab it.
      results = results.map(r => ({ id: r.name, name: r.name }));

      //Check to make sure that fields exist in the source,
      //if not throw an error to the user.
      if (!results.length) {
        throw new Error(message.NO_FIELDS);
      }

      return results;
    })
    .catch(handleError);
};

module.exports = {
  key: 'sourceFields',
  noun: 'Fields',

  display: {
    label: 'List of Fields in source',
    description: 'Hidden trigger in the app responsible for dynamic drop down',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation: {
    perform,
    canPaginate: true, //In case the number of results is very high, allows for the results to be displayed in pages
  },
};
