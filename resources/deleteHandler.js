'use strict';

const handleError = require('../utils').handleError;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

const handleDeleteCreation = (z, bundle) => {

  const promise = z.request({
    url: `https://` + push + `/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    body: z.JSON.stringify({
      documentId: encodeURI(bundle.inputData.docId),
      title: bundle.inputData.title,
      deleteChildren: true,	  	 	  
    }),
    params:{
      documentId: encodeURI(bundle.inputData.docId),
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
      throw new Error('Error occured sending delete request to Coveo: ' + z.JSON.parse(response.content).message);
    }
  
    const responseOutput = z.JSON.parse(response.request.body);
    responseOutput.orgId = `${bundle.inputData.orgId}`;
    responseOutput.sourceId = `${bundle.inputData.sourceId}`;
    delete responseOutput.deleteChildren;
  
    return getOutputInfo(z, bundle, responseOutput);
  
  })
    .then((result) => {
      return result;
    })
    .catch(handleError);
};

module.exports = {

  handleDeleteCreation,

};