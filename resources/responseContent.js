'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;

//Function to construct an object appropriate for the user to see
//when they want to use information from Coveo actions on other apps on Zapier.
//Since we do not return anything useful other than the input information in our
//responses...manually construct the response content with other calls to Coveo.
//Putting the details of the file could be beneficial here if they pushed some file,
//but this could create huge output if they sent 50 files (the maximum number),
//so perhaps the base file only in the output?
const getOrgInfoForOutput = (z, bundle) => {

  //Make bytes more readable and understandable
  const pretty = require('prettysize');

  //On top of the input information the user supplied being returned as output
  //of the action on Zapier, these are the custom ones constructed. The source type,
  //the name of the source, the owner of the source, the number of documents in the source,
  //the total memory used in the source, the org owners, as well as the org name.
  const outputInfo = {
    sourceType: '',
    sourceName: '',
    sourceOwner: '',
    numDocs: '',
    docSize: '',
    orgName: '',
    orgOwner: '',
  };

  //Start promise to get org information from Coveo
  const orgInfoPromise = z.request({
    url : `https://${platform}/rest/organizations/${bundle.inputData.orgId}`,
    method: 'GET',
  });

  //Handle request response from Coveo
  return orgInfoPromise.then((response) => {

    if(response.status >= 400){
      throw new Error('Error getting organization name: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    //Assign only the info I'm interested in from the response
    const result = z.JSON.parse(response.content);
    outputInfo.orgName = result.displayName;
    outputInfo.orgOwner = result.owner.email;

  })
    //Got org info, onto source info
    .then(() => {

      //Get the source information the user pushed to from Coveo
      const orgSourcesPromise = z.request({
        url: `https://${platform}/rest/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}`,
        method: 'GET',
      });

      //Handle response from request
      return orgSourcesPromise.then((response) => {

        if(response.status >= 400){
          throw new Error('Error getting source name and fields: ' , z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
        }

        //Get only the information that I find useful from the response
        //and throw it into the object response.
        const result = z.JSON.parse(response.content);
        outputInfo.sourceName = result.name;
        //Owner of source comes back at abc@coveo.com-google. '-google' isn't necessary for this and looks
        //cleaner without it.
        outputInfo.sourceOwner = (result.owner || '').split('-')[0];
        outputInfo.sourceType = result.sourceType;
        outputInfo.numDocs = result.information.numberOfDocuments;
        //Make the bytes turn into something more appropriate (KB, MB ,etc.)
        outputInfo.docSize = pretty(result.information.documentsTotalSize);

        return outputInfo;

      })
        .then(() => {

          //Put the input data from the bundle the user made into the object where
          //I stored the information from Coveo calls I found useful.
          Object.assign(outputInfo, bundle.inputData);

          return outputInfo;
        })
        .catch(handleError);
    })
    .catch(handleError);
};

module.exports ={
  getOrgInfoForOutput,
};