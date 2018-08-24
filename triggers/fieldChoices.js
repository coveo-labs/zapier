'use strict';

//Currently not needed, but if Zapier one day allows for drop down lists alongside of the dict property in
//their input field declarations, this would make the app very simple to use. Just make sure to include it in
//index.js if this happens one day.

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actually showing up in the app. This allows the creation of dynamic drop downs for the input users
//can use to get choices instead of manually inputting some information. This specific function
//gets the fields used by a specific org, fills the input value with the field name, and displays the field name in a readable format.
const perform = (z, bundle) => {

  //No source/org ID or both chosen yet, so throw an error
  if(!bundle.inputData.orgId && !bundle.inputData.sourceId){
    throw new Error(message.SELECT_ORG_AND_SOURCE);
  }

  //Request to Coveo to get fields that specified source uses in it's mappings. Source ID and Org ID must be
  //given by the user beforehand for this to work.
  const orgFieldsPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/indexes/page/fields`,
    method: 'GET',
  });

  //Handle response
  return orgFieldsPromise
    .then(response => {
      if (response.status >= 400) {
        throw new Error(
          'Error getting field choices for the drop down: ' +
            z.JSON.parse(response.content).message +
            ' Error Code: ' +
            response.status
        );
      }

      let results = z.JSON.parse(response.content);
      results = results.items || [];
      if (!results.map) {
        //Make sure it's an array
        results = [];
      }

      //Only want the ids and names of the fields from this call.
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
