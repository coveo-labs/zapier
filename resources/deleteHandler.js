'use strict';

const utils = require('../utils');
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const push = require('../config').PUSH;

// This function does as it says, it handles the process of creating a delete request to Coveo.
const handleDeleteCreation = (z, bundle) => {
  // Set te status of the source before any push is sent to it
  const statePromise = utils.setSourceStatus(z, bundle, 'INCREMENTAL');

  return statePromise
    .then(() => {
      // Send delete request to Coveo with deleteChildren always true.
      const deletePromise = z.request({
        url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'DELETE',
        params: {
          documentId: bundle.inputData.documentId,
          deleteChildren: true,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      // Handle request response
      return deletePromise
        .then(response => {
          const p = utils.setSourceStatus(z, bundle, 'IDLE');

          if (response.status !== 202) {
            utils.coveoErrorHandler(response.status);
          }

          // Set the status of the source back once the delete has succeeded
          return p;
        })
        .then(() => {
          // Send to responseContent handler
          return getOutputInfo(z, bundle);
        })
        .catch(utils.handleError);
    })
    .catch(utils.handleError);
};

module.exports = {
  handleDeleteCreation,
};
