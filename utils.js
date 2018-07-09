'use strict';

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;

};

const fetchFile = (url) => {

  const fetch = require('node-fetch');
  const contentDisposition = require('content-disposition');
  const path = require('path');

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

      if (disposition) {
        details.filename = contentDisposition.parse(disposition).parameters.filename;
        details.contentType = path.extname(details.filename);
      }

      //The url Zapier supplies for files sometimes leaves the contentType blank or undefined. Not sure if
      //null is possible, so I put it in as a precaution.
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
