'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

const getSourceChoicesForInput = (z, bundle) => {

  const orgSources = [];
  
  const orgSourcesPromise = z.request({
  
    url: `https://` + platform + `/rest/organizations/${bundle.inputData.orgId}/sources`,
    method: 'GET',
    body: {
      organizationId: bundle.inputData.orgId,
    },
    params: {
      organizationId: bundle.inputData.orgId,
    },
  });
  
  return orgSourcesPromise.then((response) => {
  
    if(response.status >= 400){
      throw new Error('Error getting source choices for dropdown. The organization ID must be chosen first to get these choices: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    const results = z.JSON.parse(response.content);
     
    for(var i = 0; i < results.length; i++){
      orgSources.push({'id': results[i].id, 'name': results[i].name});
    }

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
    hidden: true,
  },

  operation:{
    perform: getSourceChoicesForInput,
    canPaginate: true,
  },
};