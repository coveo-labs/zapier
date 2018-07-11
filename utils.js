'use strict';

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;

};

const handleZip = (details) => {

  let zipDetails ={
    content: '',
    contentType: '',
    size: 0,
    filename: '',
  };

  const JSZIP = require('jszip');
  var zip = new JSZIP();

    const zipFile = zip.loadAsync(details.content);

    return zipFile.then((zip) => {

      let name = Object.keys(zip.files);
      zipDetails.filename = name[0];
      zipDetails.contentType = '.' + zipDetails.filename.split('.')[1].split('/')[0];
      zipDetails.content = zip.files[name[0]]._data.compressedContent;
      zipDetails.size = zip.files[name[0]]._data.uncompressedSize;

      return zipDetails;

    });

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
      //null is possible, so I put it in just to be safe.
      if(details.contentType === 'undefined' || details.contentType === 'null' || details.contentType === ''){
        details.contentType = '.' + response.headers.get('content-type').split('/')[1].split(';')[0];
      }
      //This is returning a promise, so the promise must be executed before filling
      //the content of the file details with the file buffer.
      return response.buffer();

    })
    .then((content) => {

      if(details.contentType === '.zip'){

        details.content = content;
        return handleZip(details);

      } else {

        details.content = content;
        return details;

      }

    });
};

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');


module.exports = {
  fetchFile,
  handleError,
  getStringByteSize,
};
