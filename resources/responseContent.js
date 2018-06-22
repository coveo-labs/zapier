'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');

const utils = require('../utils');
const handleError = utils.handleError;
const getStringByteSize = utils.getStringByteSize;

const createContainer = (z, bundle) => {

	let url = `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/files`;

	const promise = z.request(url, {

		method: 'POST',
		body: {},
		headers: {

			'Content-Type': 'application/json',
			'Accept': 'application/json',

		},

	});

	return promise.then(response => {

		if(response.status !== 201){

			throw new Error('Error creating new file container: ' + response.content);

		}

		const result = z.JSON.parse(response.content);

		return result;

	})
	 .catch(handleError);

};

const uploadFileToContainer = (z, bundle, content) => {

	let url = `${bundle.inputData.uploadUri}`;

	const promise = z.request(url, {

		method: 'PUT',
		body: content,
		headers: bundle.inputData.requiredHeaders,

	});

	return promise.then((response) => {

		if(response.status !== 200) {

			throw new Error('Error uploading file contents to container: ' + response.content);

		}

		const result = z.JSON.parse(response.status);

		return result;

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
	uploadFileToContainer,
	completeBody,
	completeParams,

};
