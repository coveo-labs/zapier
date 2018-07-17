'use strict';

//Simple function to handle an error occuring in a function that I didn't catch.
//For instance, an error in grabbing the index of an array out of bounds would be caught by this.
const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error('Error occured: ' + error);
  }

  throw error;

};

//This is the handler for extracting all the files within a zip file. Extracts the files important features
// for pushing to Coveo (sizes, content of files, file types, file names).
const handleZip = (details) => {

  const addOrUpdate = [];

  const JSZIP = require('jszip');
  const zip = new JSZIP();

  const zipFile = zip.loadAsync(details.content);

  return zipFile.then((zip) => {

    let names = Object.keys(zip.files);

    //Set limit on number of documents that a zip file can contain in order to avoid
    //customers sending hundreds of files at once and crashing services
    if(names.length > 30){
      throw new Error('The maximum number of files that can be sent in a zip file is 30. Please reduce the number of files in the zip file and try again.');
    }

    for(let i = 0; i < names.length; i++){

      let zipContent = {};

      //These files are mac dependent and don't have any valuable content, so ignore them.
      if(names[i].indexOf('__MACOSX/') > -1){
      } else {

        zipContent.content = zip.files[names[i]]._data.compressedContent;
        zipContent.contentType = names[i].split('.')[1].split('/')[0];
        zipContent.size = zip.files[names[i]]._data.compressedSize;
        zipContent.filename = names[i];

        if(zipContent.size == zip.files[names[i]]._data.uncompressedSize){
          zipContent.compressionType = 'UNCOMPRESSED';
        } else {
          zipContent.compressionType = 'DEFLATE';
        }

        addOrUpdate.push(zipContent);

      }

    }

    addOrUpdate.badFetch = details.badFetch;
    return addOrUpdate;

  });

};

//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url). If a bad fetch occurs, fails or incorrect url, a flag will indicate for later functions to handle.
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If zip file sent, see handleZip for how it 
//is dealt with.
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

      //If the url given is redirected to another place, doesn;t match the given url, or contains link, the given file url
      //wasn't the url content was extracted from. So, set the bad fetch flag to true.
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

      //Zip file, send to handleZip to get content
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
