'use strict';

const handleError = require('../utils').handleError;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

//This function does as it says, it handles the process of creating a
//delete request to Coveo and then handles the response content to generate
//an appropriate Object for Zapier to handle the output.
const handleDeleteCreation = (z, bundle) => {

  //Send delete request to Coveo with deleteChildren always true.
  //Only need to send 3 things opposed to the entire the modified bundle
  //in a push, so just pick those 3 and send them off.
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    body: JSON.stringify({
      title: bundle.inputData.title,
    }),
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

    //No point in saving this for the response content the user sees.
    //Better practice for this to always be true and its already indicated
    //to the user that this always happens in a delete.
    delete bundle.inputData.deleteChildren;

    //Send to responseContent handler
    return getOutputInfo(z, bundle);

  })
    .catch(handleError);
};

module.exports = {
  handleDeleteCreation,
};