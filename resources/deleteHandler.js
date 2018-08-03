'use strict';

const handleError = require('../utils').handleError;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

//This function does as it says, it handles the process of creating a
//delete request to Coveo.
const handleDeleteCreation = (z, bundle) => {

  //Send delete request to Coveo with deleteChildren always true.
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    params:{
      documentId: bundle.inputData.documentId,
      deleteChildren: true,
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  //Handle request response
  return promise.then((response) => {

    if(response.status !== 202){
      throw new Error('Error occurred sending delete request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }


    //Send to responseContent handler
    return getOutputInfo(z, bundle);

  })
    .catch(handleError);
};

module.exports = {
  handleDeleteCreation,
};