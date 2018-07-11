'use strict';

const utils = require('../utils');
const messages = require('../messages');
const platform = messages.PLATFORM;
const handleError = utils.handleError;

const getFieldChoicesForInput = (z, bundle) => {

  const sourceFields = [];
  
  const sourceFieldsPromise = z.request({
  
    url: `https://` + platform + `/rest/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}`,
    method: 'GET',
    body: {
      organizationId: bundle.inputData.orgId,
      sourceId: bundle.inputData.sourceId,
    },
    params: {
      organizationId: bundle.inputData.orgId,
      sourceId: bundle.inputData.sourceId,
    },
  });
  
  return sourceFieldsPromise.then((response) => {
  
    if(response.status >= 400){
      throw new Error('Error getting field choices for dropdown. The source and organization must be chosen first to get these choices: ' + response.content);
    }
  
    const results = z.JSON.parse(response.content);
     
    for(var i = 0; i < results.mappings.length; i++){
      sourceFields.push({'id': results.mappings[i].id, 'fieldName': results.mappings[i].fieldName});
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
    hidden: true,
  },

  operation:{
    perform: getFieldChoicesForInput,
    canPaginate: true,
  },
};