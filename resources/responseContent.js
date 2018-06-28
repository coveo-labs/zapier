'use strict';

const utils = require('../utils');
const handleError = utils.handleError;
const getStringByteSize = utils.getStringByteSize;
const fileDetails = utils.fetchFile;

const createContainerAndUpload = (z, bundle) => {

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
      throw new Error('Error creating fiel container: ' + response.content);      
    }
                
    const result = z.JSON.parse(response.content);        
    return result;
        
  })
    .then((result) => {

      let url = result.uploadUri;
      let details = bundle.inputData.content;
      const body = fileDetails(details);

      const promise = z.request(url, {
        method: 'PUT',
        body,
        headers: result.requiredHeaders,
      });

      return promise.then((response) => {

        if(response.status != 200) {
          throw new Error('Error uploading file contents to container: ' + response.content);
        }

        return result;

      })
        .catch(handleError);

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

  createContainerAndUpload,
  completeBody,
  completeParams,

};
