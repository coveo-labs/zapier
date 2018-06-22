'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');

const utils = require('../utils');
const handleError = utils.handleError;
const getStringByteSize = utils.getStringByteSize;

const createContainer = (z, bundle) => {

	const promise = z.request({

		url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/files`,
		method: 'POST',
		headers: {

			'Content-Type': 'application/json',
			'Accept': 'application/json',

		},

	});

	return promise.then(response => {

		if(response.status !== 201){

			throw new Error('Error creating new file container.');

		}

		return response.content;

	})
	 .catch(handleError);

};

const completeBody = (bundle) => {

	const body = {

	  documentId: bundle.inputData.docId,
	  title: bundle.inputData.title,
	  content: bundle.inputData.content,
	  Data: bundle.inputData.data,
	  thumbnail: bundle.inputData.thumbnail,
	  documentdownload: bundle.inputData.download,

	};

	return body;

};

const completeParams = (bundle) => {

	const params = {

	 documentId: encodeURI(bundle.inputData.docId),
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data,
	 thumbnail: bundle.inputData.thumbnail,
	 documentdownload: bundle.inputData.download,

	};

	return params;

};

module.exports = {

	createContainer,
	completeBody,
	completeParams,

};
