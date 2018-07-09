'use strict';

const utils = require('../utils');
const handleError = utils.handleError;

const getSourceChoicesForInput = (z, bundle) => {

    const orgSources = [];
  
    const orgSourcesPromise = z.request({
  
      url: `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}/sources`,
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
        throw new Error('Error getting organization choices for dropdown. The source must be chosen first to get these choices: ' + response.content);
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
    }
};