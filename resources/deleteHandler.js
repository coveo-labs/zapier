'use strict';

const utils = require('../utils');
const push = require('../config').PUSH;

// This function does as it says, it handles the process of creating a delete request to Coveo.
const handleDeleteCreation = (z, bundle) => {
  // Set te status of the source before any push is sent to it
  const statePromise = utils.setSourceStatus(z, bundle, 'INCREMENTAL');

  return statePromise
    .then(() => {
      // Send delete request to Coveo with deleteChildren always true.
      const deletePromise = z.request({
        url: `https://${push}/v1/organizations/${bundle.inputData.organizationId}/sources/${bundle.inputData.sourceId}/documents`,
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
          utils.setSourceStatus(z, bundle, 'IDLE');

          if (response.status !== 202) {
            utils.coveoErrorHandler(response.status);
          }

          // Set the status of the source back once the delete has succeeded
          return bundle.inputData;
        })
        .catch(utils.handleError);
    })
    .catch(utils.handleError);
};

module.exports = {
  handleDeleteCreation,
};
