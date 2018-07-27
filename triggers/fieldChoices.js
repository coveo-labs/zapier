'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic dropdowns for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the fields used by a specific source, fills the input value with the field name, and displays the field name in a readable format.
const getFieldChoicesForInput = (z, bundle) => {
  
  z.console.log('Bundle: ' , bundle.inputData);

  //Request to Coveo to get fields that specified source uses in it's mappings. Source ID and Org ID must be
  //given by the user beforehand for this to work.
  const sourceFieldsPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}`,
    method: 'GET',
  });
  
  //Handle response
  return sourceFieldsPromise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting field choices for dropdown. Please ensure the source and organization IDs have been selected already: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    const results = z.JSON.parse(response.content);

    //Only want the ids and names of the fields from this call. If the field has
    //already been selected in another input box, ignore it, otherwise grab it.
    let sourceFields = results.mappings.map(r => {
      return {id: r.id, fieldName: r.fieldName};
    });

    //Check to make sure that fields exist in the source as mappings,
    //if not throw an error to the user.
    if(!Array.isArray(sourceFields) || sourceFields.length == 0){
      throw new Error(message.NO_FIELDS);
    }

    return sourceFields;
  
  })
    .catch(handleError);
};

module.exports = {
  key: 'sourceFields',
  noun: 'Fields',

  display: {
    label: 'List of Fields in source',
    description: 'Hidden trigger in the app responsible for dynamic dropdown',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation:{
    perform: getFieldChoicesForInput,
    canPaginate: true, //Incase the nuber of fields is very high, allos for the results to be displayed in pages
  },
};