'use strict';

const _ = require('lodash');
const utils = require('../utils');
const handleError = utils.handleError;
const getFileDetailsFromRequest = utils.getFileDetailsFromRequest;

// create a push
const createPush = (z, bundle) => {

  const promise = z.request({

    url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'PUT',
    body: JSON.stringify({
      documentId: bundle.inputData.docId,
      title: bundle.inputData.title,
      content: bundle.inputData.content,
      Data: bundle.inputData.data,
      thumbnail: bundle.inputData.thumbnail,
      documentdownload: bundle.inputData.download,	  	 	  
    }),

    params:{
      documentId: encodeURI(bundle.inputData.docId),
      title: bundle.inputData.title,
      content: bundle.inputData.content,
      Data: bundle.inputData.data,
      thumbnail: bundle.inputData.thumbnail,
      documentdownload: bundle.inputData.download,
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
      Organization: `${bundle.inputData.orgId}`,
      Source: `${bundle.inputData.sourceId}`,
      Platform: `${bundle.inputData.platform}`,
      Title: `${bundle.inputData.title}`,
      Files: `${bundle.inputData.content}`,
      Content: `${bundle.inputData.data}`,
      Downloads: `${bundle.inputData.download}`,
    };
  });
};

module.exports = {  
  key: 'push',
  noun: 'Push',

  sample: {
    docId: 'file://folder/my-file.html',
    sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
    orgId: 'mycoveocloudv2organizationg8tp8wu3',
    platform: 'push.cloud.coveo.com',
    title: 'my-file.html',
    content: '<files here>',
    data: '<plain text here>',
    download: '<download links here>',	
  },

  outputFields: [
    {key: 'docId', label: 'Document'},
    {key: 'orgId', label: 'Organization'},
    {key: 'sourceId', label: 'Source'},
    {key: 'platform', label: 'Platform'},
    {key: 'title', label: 'Title'},
    {key: 'content', label: 'Files'},
    {key: 'data', label: 'Content (plain text)'},
    {key: 'download', label: 'Download Links'},
  ],
};
