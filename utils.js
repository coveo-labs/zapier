'use strict';

const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error('Error occured: ' + error);
  }

  throw error;

};

const handleZip = (details) => {

  const addOrUpdate = [];

  const JSZIP = require('jszip');
  const zip = new JSZIP();

  const zipFile = zip.loadAsync(details.content);

  return zipFile.then((zip) => {

    let name = Object.keys(zip.files);

    for(var i = 0; i < name.length; i++){
      if(name[i].indexOf('__MACOSX/') > -1){
      } else {
        addOrUpdate.push({'content': zip.files[name[i]]._data.compressedContent, 'contentType': '.' + name[i].split('.')[1].split('/')[0], 'size': zip.files[name[i]]._data.compressedSize, 'filename': name[i]});
      }
    }

    addOrUpdate.badFetch = details.badFetch;
    return addOrUpdate;

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

      if(response.headers.get('link') || response.url !== url){
        details.badFetch = true;
      }

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

      details.content = content;

      if(details.contentType === '.zip'){
        return handleZip(details);
      } 
      
        return details;
      
    });
};

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');


module.exports = {
  fetchFile,
  handleError,
  getStringByteSize,
};
