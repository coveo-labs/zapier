'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

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
      throw new Error('Error getting field choices for dropdown. The source ID and organization ID must be chosen first to get these choices.');
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