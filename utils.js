'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');
const contentDisposition = require('content-disposition');

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;
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

const fileDetails = (url) => new Promise((resolve, reject) => {

	const details = {

		filename: '',
		size: 0,
		content: '',
		contentType: '',

	};

	fetch(url)

	 .then((response) => {

		details.contentType = response.headers.get('content-type');
		details.size = response.headers.get('content-length');
		const disposition = response.headers.get('content-disposition');

		if(disposition){

			details.filename = contentDisposition.parse(disposition).parameters.filename;

		}

		return response.buffer();

	})
	 
	 .then((content) => {

		details.content = content;

		return resolve(details);

	 })
	  
	 .catch(reject);

});

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');

module.exports = {
  completeBody,
  completeParams,
  fileDetails,
  handleError,
  getStringByteSize,
};
