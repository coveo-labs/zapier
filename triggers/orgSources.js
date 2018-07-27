'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic dropdowns for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the possible push sources that are in the specified org, puts the source id in the input value, and displays the source name as in readable format.
const getSourceChoicesForInput = (z, bundle) => {
  
  //Request to Coveo to get fields that specified source uses in it's mappings. Org ID must be
  //given by the user beforehand for this to work.
  const orgSourcesPromise = z.request({
    url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources`,
    method: 'GET',
  });
  
  //Handle response
  return orgSourcesPromise.then((response) => {

    let orgSources = [];

    if(response.status >= 400){
      throw new Error('Error getting source choices for dropdown. The organization ID must be chosen first to get these choices: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    const results = z.JSON.parse(response.content);
     
    //Only want source ids and names from this call, ignore sources that aren't push as well, since we can only use this app to push to a push source.
    results.forEach(source => {
      if(source.sourceType == 'PUSH'){
        orgSources.push({'id': source.id, 'name': source.name});
      }
    });

    return orgSources;
  
  })
    .catch(handleError);
};

module.exports = {
  key: 'orgSources',
  noun: 'Sources',

  display: {
    label: 'List of Sources',
    description: 'Hidden trigger in the app responsible for dynamic dropdown',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation:{
    perform: getSourceChoicesForInput,
    canPaginate: true, //Incase the nuber of fields is very high, allos for the results to be displayed in pages
  },
};