'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

const getOrgChoicesForInput = (z) => {
  
  const orgChoicesPromise = z.request({
  
    url: `https://${platform}/rest/organizations/`,
    method: 'GET',
    body: {},
  
  });
  
  return orgChoicesPromise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting organization choices for dropdown: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    const results = z.JSON.parse(response.content);
     
    let orgChoices = results.map( r => {
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
    hidden: true,
  },

  operation:{
    perform: getOrgChoicesForInput,
    canPaginate: true,
  },
};