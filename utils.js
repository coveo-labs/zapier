'use strict';

const fetch = require('node-fetch');
const contentDisposition = require('content-disposition');

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

  return fetch(url)
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
      return details;

    });

};

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');

module.exports = {
  fileDetails,
  handleError,
  getStringByteSize,
};
