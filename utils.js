'use strict';

const fetch = require('node-fetch');
const contentDisposition = require('content-disposition');
const path = require('path');

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;

};

const fetchFile = (url) => {

  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };

  return fetch(url)
    .then((response) => {

      details.size = response.headers.get('content-length');
      const disposition = response.headers.get('content-disposition');

      if(disposition){
        details.filename = contentDisposition.parse(disposition).parameters.filename;
        details.contentType = path.extname(details.filename);
      }

      if(details.contentType === 'undefined' || details.contentType === 'null' || details.contentType === ''){
        details.contentType = '.' + response.headers.get('content-type').split('/')[1].split(';')[0];
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
  fetchFile,
  handleError,
  getStringByteSize,
};
