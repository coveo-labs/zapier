'use strict';

const utils = require('../utils');
const handleError = utils.handleError;

var numFields = 0;

const getOrgInfoForInput = (z) => {

  const inputInfo = {
    orgChoices: [],
  };

  const promise = z.request({

    url: 'https://platformdev.cloud.coveo.com/rest/organizations/',
    method: 'GET',
    body: {},

  });

  return promise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting source details: ' + response.content);
    }

    const result = z.JSON.parse(response.content);

    for(var i = 0; i < result.length; i++){
      inputInfo.orgChoices[result[i].displayName] = result[i].id;
    }

    return inputInfo;

  })
    .catch(handleError);
};

const getOrgInfoForOutput = (z, bundle, responseOutput) => {

  const outputInfo = {
    sourceType: '',
    sourceName: '',
    sourceOwner: '',
    numDocs: '',
    orgName: '',
    orgOwner: '',
  };

  const promise = z.request({

    url : `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}`,
    method: 'GET',
    body: {
      organizationId: bundle.inputData.orgId,
    },
    params: {
      organizationId: bundle.inputData.orgId,
    },

  });

  return promise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting organization name: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    outputInfo.orgName = result.displayName;
    outputInfo.orgOwner = result.owner.email;

  })
    .then(() => {

      const newPromise = z.request({

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

      return newPromise.then((response) => {

        if(response.status >= 400){
          throw new Error('Error getting source name and fields: ' , response.content);
        }

        const newResult = z.JSON.parse(response.content);
        outputInfo.sourceName = newResult.name;
        outputInfo.sourceOwner = newResult.owner.substr(0, newResult.owner.indexOf('-'));
        outputInfo.sourceType = newResult.sourceType;
        outputInfo.numDocs = newResult.information.numberOfDocuments;

        for(var j = 0; j < newResult.mappings.length; j++){
          var temp = 'Field #' + (j + 1).toString();
          outputInfo[temp] = newResult.mappings[j].fieldName;
          numFields++;
        }

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
  getOrgInfoForInput,
  getOrgInfoForOutput,
  numFields,
};