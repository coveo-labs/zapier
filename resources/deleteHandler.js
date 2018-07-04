'use strict';

const utils = require('../utils');
const handleError = utils.handleError;

const handleDeleteCreation = (z, bundle) => {

  const promise = z.request({
    url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    body: z.JSON.stringify({
      documentId: encodeURI(bundle.inputData.docId),
      deleteChildren: true,	  	 	  
    }),
    params:{
      documentId: encodeURI(bundle.inputData.docId),
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
    responseOutput.platform = `${bundle.inputData.platform}`;
  
    return responseOutput;
  
  })
    .then((result) => {
      return result;
    })
    .catch(handleError);
};

module.exports = {

  handleDeleteCreation,

};