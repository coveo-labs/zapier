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
        }

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
		Content: `${bundle.inputData.content}`,
		Purpose: `${bundle.inputData.data}`,
		Downloads: `${bundle.inputData.download}`,
		};
     });
};

module.exports = {
  key: 'push',
  noun: 'Push',

  create: {
    display: {
      label: 'Push or Update',
      description: 'Push/Update an Item to a Specified Push Source.'
    },
    operation: {
      inputFields: [
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The main URL to your document or page you wish to push.'
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
	label: 'Source ID',
        helpText: 'The ID of the source in the Coveo Cloud V2 Organization you wish to push to.'
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        helpText: 'The ID of the organization where your source is located.'
      },
      {
        key: 'platform',
        required: true,
	label: 'Platform',
        choices: { 'pushdev.cloud.coveo.com': 'Dev', 'pushqa.cloud.coveo.com': 'QA', 'push.cloud.coveo.com': 'Prod' },
        helpText: 'The platform in which your organization lives.'
      },
      {
	key: 'title',
	required: true,
	type: 'string',
	label: 'Title of Submission',
	helpText: 'The title to be displayed within the content browser.'
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Content',
        helpText: 'Content of the submission in plain text.'
      },
      {
	key: 'thumbnail',
	required: false,
	type: 'string',
	label: 'Thumbnail',
	helpText: 'Thumbnail to go with the main url supplied.'
      },
      {
	key: 'download',
	required: false,
	type: 'string',
	label: 'Download link',
	helpText: 'Download links of the file if they exist.'
      },
      {
	key: 'content',
	required: false,
	type: 'string',
	label: 'Files',
	helpText: 'Any files or attachments you wish to push the contents of to the source.' 
      }
    ],
      perform: createPush,
    },
  },

  sample: {
	docId: 'file://folder/my-file.html',
	sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
	orgId: 'mycoveocloudv2organizationg8tp8wu3',
	platform: 'push.cloud.coveo.com',
	title: 'my-file.html',
  },

  outputFields: [
	{key: 'docId', label: 'Document Url'},
	{key: 'title', label: 'File Title'},
	{key: 'content', label: 'Additional content about the file pushed'},
	{key: 'data', label: 'Description of purpose of the pushed file'}
  ]
};
