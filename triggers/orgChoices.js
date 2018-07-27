'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic dropdowns for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the possible organizations the user has access to, puts the org Id as the input value, and displays the org name in a readable format. 
const getOrgChoicesForInput = (z) => {
  
  //Request to Coveo to get organizations user has access to.
  const orgChoicesPromise = z.request({
    url: `https://${platform}/rest/organizations/`,
    method: 'GET',
  });
  
  //Handle response
  return orgChoicesPromise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting organization choices for dropdown: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    const results = z.JSON.parse(response.content);
     
    //Only wants org ids and names from this call
    let orgChoices = results.map(r => {
      return {id: r.id, displayName: r.displayName};
    });

    return orgChoices;
  
  })
    .catch(handleError);
};

module.exports = {
  key: 'orgChoices',
  noun: 'Orgs',

  display: {
    label: 'List of Organizations',
    description: 'Hidden trigger in the app responsible for dynamic dropdown',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation:{
    perform: getOrgChoicesForInput,
    canPaginate: true, //Incase the nuber of fields is very high, allos for the results to be displayed in pages
  },
};