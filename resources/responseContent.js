'use strict';

const utils = require('../utils');
const handleError = utils.handleError;

//Used to make the output format Zapier uses more flexible and dynamic. See
//resources/push.js. Will remove for safer method.
let numFields = 0;

const getOrgInfoForOutput = (z, bundle, responseOutput) => {

  const outputInfo = {
    sourceType: '',
    sourceName: '',
    sourceOwner: '',
    numDocs: '',
    orgName: '',
    orgOwner: '',
  };

  const orgInfoPromise = z.request({

    url : `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}`,
    method: 'GET',
    body: {
      organizationId: bundle.inputData.orgId,
    },
    params: {
      organizationId: bundle.inputData.orgId,
    },

  });

  return orgInfoPromise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting organization name: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    outputInfo.orgName = result.displayName;
    outputInfo.orgOwner = result.owner.email;

  })
    .then(() => {

      const orgSourcesPromise = z.request({

        url: `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}`,
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

      return orgSourcesPromise.then((response) => {

        if(response.status >= 400){
          throw new Error('Error getting source name and fields: ' , response.content);
        }

        const result = z.JSON.parse(response.content);
        outputInfo.sourceName = result.name;
        //Owner of source comes back at abc@coveo.com-google. '-google' isn't necessary for this and looks
        //cleaner.
        outputInfo.sourceOwner = (result.owner || '').split('-')[0];
        outputInfo.sourceType = result.sourceType;
        outputInfo.numDocs = result.information.numberOfDocuments;

        result.mappings.forEach((mapping, idx) => {
          let filedNum = 'Field #' + (idx + 1);
          outputInfo[filedNum] = mapping.fieldName;
          numFields++;
        })

        return outputInfo;

      })
        .then(() => {

          for(var j = 0; j < Object.keys(responseOutput).length; j++){
            outputInfo[Object.keys(responseOutput)[j]] = responseOutput[Object.keys(responseOutput)[j]];
          }

          outputInfo.orgId = `${bundle.inputData.orgId}`;
          outputInfo.sourceId = `${bundle.inputData.sourceId}`;
          outputInfo.platform = `${bundle.inputData.platform}`;

          return outputInfo;
        })
        .catch(handleError);
    })
    .catch(handleError);

};

module.exports ={
  getOrgInfoForOutput,
  numFields,
};