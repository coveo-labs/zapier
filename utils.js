'use strict';

const fetch = require('node-fetch');

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;

};

const fileDetails = (url) => {

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

      return response.buffer();

		})
		.then((content) => {

      details.content = content;
		
      return details;

	 });

};

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');

module.exports = {
  fileDetails,
  handleError,
  getStringByteSize,
};
