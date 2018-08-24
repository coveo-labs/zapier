'use strict';

const { handleError, coveoErrorHandler, setSourceStatus } = require('../utils');
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

//This function does as it says, it handles the process of creating a
//delete request to Coveo.
const handleDeleteCreation = (z, bundle) => {
  //Set te status of the source before any push is sent to it
  const statePromise = setSourceStatus(z, bundle, 'INCREMENTAL');

  return statePromise.then(() => {

  //Send delete request to Coveo with deleteChildren always true.
    const deletePromise = z.request({
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
    return deletePromise.then((response) => {

      if(response.status !== 202){
        coveoErrorHandler(response.status);
      }

      //Set the status of the source back once the delete has succeeded
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