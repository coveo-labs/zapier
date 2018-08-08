'use strict';

const { handleError, setSourceStatus } = require('../utils');
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

//This function does as it says, it handles the process of creating a
//delete request to Coveo.
const handleDeleteCreation = (z, bundle) => {
  //Set te status of the source before any push is sent to it
  const setStatusBefore = setSourceStatus(z, bundle, 'INCREMENTAL');

  return setStatusBefore.then(() => {

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

    //Set the status of the source back once the push has succeeded
    return setSourceStatus(z, bundle, 'IDLE');
  })
  .then(() => {
    //Send to responseContent handler
    return getOutputInfo(z, bundle);
  })
    .catch(handleError);
  })
  .catch(handleError);
};

module.exports = {
  handleDeleteCreation,
};