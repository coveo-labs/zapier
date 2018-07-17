'use strict';

const handleError = require('../utils').handleError;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

const handleDeleteCreation = (z, bundle) => {

  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    body: z.JSON.stringify({
      documentId: bundle.inputData.documentId,
      title: bundle.inputData.title,
      deleteChildren: true,	  	 	  
    }),
    params:{
      documentId: bundle.inputData.documentId,
      title: bundle.inputData.title,
      deleteChildren: true,
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  return promise.then((response) => { 
   
    if(response.status !== 202){
      throw new Error('Error occured sending delete request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }
  
    delete bundle.inputData.deleteChildren;
  
    return getOutputInfo(z, bundle);
  
  })
    .catch(handleError);
};

module.exports = {
  handleDeleteCreation,
};