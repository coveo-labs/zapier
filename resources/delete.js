'use strict';

const _ = require('lodash');
const utils = require('../utils');
const handleError = utils.handleError;

const createNewDelete = (z, bundle) => {

  const promise = z.request({
    url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'DELETE',
    body: JSON.stringify({
      documentId: bundle.inputData.docId,
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

  return promise.then(response => { 
 
    if(response.status >= 400){
      throw new z.errors.HaltedError('Error occured. Multiple possible reasons (note: more than one can occur at a time): incorrect token/API key, incorrect sourceId/orgID/Platform, or a timeout.\nPlease check the following and try again. Specific error message: ' + z.JSON.parse(response.content).message);
    }

    return {Document: `${bundle.inputData.docId}`,
      Source: `${bundle.inputData.sourceId}`,
      Organization: `${bundle.inputData.orgId}`,
      Platform: `${bundle.inputData.platform}`,
    };

  });

};

module.exports = {

  key: 'delete',

  noun: 'Delete',

  sample: {
    docId: 'file://folder/my-file.html',
    sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
    orgId: 'mycoveocloudv2organizationg8tp8wu3',
    platform: 'push.cloud.coveo.com',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: [
    {key: 'docId', label: 'Document ID'},
    {key: 'sourceId', label: 'Source ID'},
    {key: 'orgId', label: 'Organization ID'},
    {key: 'platform', label: 'Platform'},
  ],

};
