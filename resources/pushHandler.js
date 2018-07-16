'use strict';

const push = require('../config').PUSH;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const fileTooBig = require('../messages').BIG_FILE;
const handleError = require('../utils').handleError;
const fetchFileDetails = require('../utils').fetchFile;
const getStringByteSize = require('../utils').getStringByteSize;

const handlePushCreation = (z, bundle) => {

  if(bundle.inputData.content == null || bundle.inputData.content == undefined || bundle.inputData.content == ''){
        
    bundle.inputData.content = 'No file/url supplied in the File input field.';
    return processPush(z, bundle);

  } else {

    const containerInfo = createContainer(z, bundle);

    return containerInfo.then((result) => {

      if(result.badFetch == true) {

        bundle.inputData.content = 'Fetching the content failed or a bad url was given in the File input field.';
        return processPush(z, bundle);

      } else {

        if(result.addOrUpdate){

          return processZipBatchPush(z, bundle, result);

        } else {

          bundle.inputData.compressedBinaryDataFileId = result.fileId;
          bundle.inputData.compressionType = 'UNCOMPRESSED';
          bundle.inputData.fileExtension = result.contentType;

          if(result.originalContentType === '.zip'){
            bundle.inputData.compressionType = 'DEFLATE';
          }

          return processPush(z, bundle);

        }

      }

    })
      .catch(handleError);
  }

};

const processZipBatchPush = (z, bundle, result) => {

  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents/batch?fileId=${result.addOrUpdate[0].compressedBinaryDataFileId}`,
    method: 'PUT',
    body: {},
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {

    if (response.status !== 202) {
      throw new Error('Error occured sending push request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    return result;

  })
  .catch(handleError);
};

const processPush = (z, bundle) => {

  if(bundle.inputData.data == null || bundle.inputData.data == '' || bundle.inputData.data == undefined || typeof bundle.inputData.data !== 'string'){
    delete bundle.inputData.data;
  }

  const promise = z.request({

    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
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
      throw new Error('Error occured sending push request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    const responseOutput = z.JSON.parse(response.request.body);

    if(bundle.inputData.content){

      delete responseOutput.compressedBinaryDataFileId;
      delete responseOutput.compressionType;
      delete responseOutput.fileExtension;

    }

    return getOutputInfo(z, bundle, responseOutput);

  })
    .then((result) => {
      return result;
    })
    .catch(handleError);
};

const createContainer = (z, bundle) => {

  let url = `https://${push}/v1/organizations/${bundle.inputData.orgId}/files`;

  const promise = z.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {

    if (response.status !== 201) {
      throw new Error('Error creating file container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    const result = z.JSON.parse(response.content);
    return uploadToContainer(z, bundle, result);

  })
    .catch(handleError);
};

const uploadZipBatchToContainer = (z, bundle, body, result) => {

  const batchContent = {
    addOrUpdate: [],
  };

  let totalSize = 0;

  if(body.badFetch == true){
    return batchContent;
  }

  for(var i = 0; i < body.length; i++){

      let batchItem = {};

      for(let k in bundle.inputData){
        batchItem[k] = bundle.inputData[k];
      }

      batchItem.title = bundle.inputData.title;
      batchItem.fileExtension = body[i].contentType;
      batchItem.compressedBinaryDataFileId = result.fileId;
      batchItem.compressionType = 'DEFLATE';
      batchItem.documentId = bundle.inputData.documentId;

      delete batchItem.orgId;
      delete batchItem.sourceId;
      delete batchItem.data;

      if(i != 0){

        batchItem.title = body[i].filename;
        batchItem.parentId = batchContent.addOrUpdate[i - 1].documentId;
        batchItem.documentId = batchItem.parentId + '/attachment';
        batchItem.compressedBinaryData = Buffer.from(body[i].content).toString('base64');
        delete batchItem.compressedBinaryDataFileId;
    
      }

    totalSize += body[i].size;

    batchContent.addOrUpdate.push(batchItem);

    if(totalSize > (1000000 * 1000)){
      throw new Error(fileTooBig);
    }

  }

  let url = result.uploadUri;
  let headers = result.requiredHeaders;

  const promise = z.request(url, {

    method: 'PUT',
    body: batchContent,
    headers: headers,

  });

  return promise.then((response) => {

    if (response.status !== 200) {
      throw new Error('Error uploading file contents to container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    const result = z.JSON.stringify(response.content);
    return result;

  })
  .then(() => {
    return batchContent;
  })
   .catch(handleError);
};

const uploadToContainer = (z, bundle, result) => {

  const containerInfo = {
    fileId: result.fileId,
    contentType: '',
    originalContentType: '',
  };

  let batchUpload = {};

  let url = result.uploadUri;
  let file = bundle.inputData.content;

  const fileDetails = fetchFileDetails(file);

  return fileDetails.then((body) => {

    if(body.badFetch){

      containerInfo.badFetch = true;
      return containerInfo;

    } else if(body.length > 0){

      batchUpload = uploadZipBatchToContainer(z, bundle, body, result);

    } else {

      containerInfo.contentType = body.contentType;
      containerInfo.originalContentType = body.originalContentType;

      if (body.size > (1000000 * 1000) || getStringByteSize(body.content) > (1000000 * 1000)) {
        throw new Error(fileTooBig);
      }

      let headers = result.requiredHeaders;
      headers['content-length'] = body.size;

      if(headers['content-length'] == null){
        headers['content-length'] = getStringByteSize(body.content);
      }

      const promise = z.request(url, {
        method: 'PUT',
        body: body.content,
        headers: headers,
      });

      return promise.then((response) => {

        if (response.status !== 200) {
          throw new Error('Error uploading file contents to container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
        }

        const result = z.JSON.stringify(response.content);
        return result;
      })
        .catch(handleError);
    }
  })
    .then(() => {
      if(batchUpload !== 'null' || batchUpload !== 'undefined'){
        return batchUpload;
      } else {
        return containerInfo;
      }
    })
    .catch(handleError);
};

module.exports = {
  handlePushCreation,
};
