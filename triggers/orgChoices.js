'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

const getOrgChoicesForInput = (z) => {

  const orgChoices = [];
  
  const orgChoicesPromise = z.request({
  
    url: 'https://' + platform + '/rest/organizations/',
    method: 'GET',
    body: {},
  
  });
  
  return orgChoicesPromise.then((response) => {
  
    if(response.status >= 400){
      throw new Error('Error getting organization choices for dropdown.');
    }
  
    const results = z.JSON.parse(response.content);
     
    for(var i = 0; i < results.length; i++){
      orgChoices.push({'id': results[i].id, 'displayName': results[i].displayName});
    }

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