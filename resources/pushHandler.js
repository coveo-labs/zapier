'use strict';

const utils = require('../utils');
const messages = require('../messages');
const responseContent = require('./responseContent');
const push = messages.PUSH;
const handleError = utils.handleError;
const fetchFileDetails = utils.fetchFile;
const getStringByteSize = utils.getStringByteSize;
const fileTooBig = messages.BIG_FILE;
const getOutputInfo = responseContent.getOrgInfoForOutput;

const handlePushCreation = (z, bundle) => {

  const containerInfo = createContainer(z, bundle);

  return containerInfo.then((container) => {

    //Temporary until I figure out a better way of handling artbitrary numbers of input fields
    bundle.inputData[bundle.inputData.field1] = bundle.inputData.field1Content;
    bundle.inputData[bundle.inputData.field2] = bundle.inputData.field2Content;
    bundle.inputData['documentId'] = bundle.inputData.docId;
    delete bundle.inputData.docId;
    delete bundle.inputData.field1;
    delete bundle.inputData.field2;
    delete bundle.inputData.field1Content;
    delete bundle.inputData.field2Content;
    bundle.inputData.compressedBinaryDataFileId = container.fileId;
    bundle.inputData.compressionType = 'UNCOMPRESSED';
    bundle.inputData.fileExtension = container.contentType;

    return processPush(z, bundle, container);

  })
    .catch(handleError);
};

const processPush = (z, bundle) => {

  const promise = z.request({

    url: `https://` + push + `/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'PUT',
    body: z.JSON.stringify(bundle.inputData),
    params: bundle.inputData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {

    if (response.status !== 202) {
      throw new Error('Error occured sending push request to Coveo: ' + z.JSON.parse(response.content).message);
    }

    const responseOutput = z.JSON.parse(response.request.body);
    delete responseOutput.compressedBinaryDataFileId;
    delete responseOutput.compressionType;
    delete responseOutput.fileExtension;

    return getOutputInfo(z, bundle, responseOutput);

  })
    .then((result) => {
      return result;
    })
    .catch(handleError);
};



const createContainer = (z, bundle) => {

  let url = `https://` + push + `/v1/organizations/${bundle.inputData.orgId}/files`;

  const promise = z.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {

    if (response.status !== 201) {
      throw new Error('Error creating file container: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    return uploadToContainer(z, bundle, result);

  })
    .catch(handleError);
};



const uploadToContainer = (z, bundle, result) => {

  const containerInfo = {
    fileId: result.fileId,
    contentType: '',
  };

  let url = result.uploadUri;
  let file = bundle.inputData.content;

  const fileDetails = fetchFileDetails(file);

  return fileDetails.then((body) => {
    containerInfo.contentType = body.contentType;

    if (body.size > (1000000 * 1000) || getStringByteSize(body.content) > (1000000 * 1000)) {
      throw new Error(fileTooBig);
    }

    let headers = result.requiredHeaders;
    headers['content-length'] = body.size;

    if(headers['content-length'] == null){
      headers['content-length'] = getStringByteSize(body.content);
    }

    console.log('Body: ' , body);

    const promise = z.request(url, {
      method: 'PUT',
      body: body.content,
      headers: headers,
    });

    return promise.then((response) => {

      if (response.status !== 200) {
        throw new Error('Error uploading file contents to container: ' + response.content);
      }

      const result = z.JSON.stringify(response.content);
      return result;
    })
      .catch(handleError);
  })
    .then(() => {
      return containerInfo;
    })
    .catch(handleError);
};

module.exports = {
  createContainer,
  uploadToContainer,
  processPush,
  handlePushCreation,
};
