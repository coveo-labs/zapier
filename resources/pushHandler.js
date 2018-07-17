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
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents/batch?fileId=${result.fileId}`,
    method: 'PUT',
    body: {},
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {

    if (response.status !== 202) {
      throw new Error('Error occured sending batch push request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    return getOutputInfo(z, bundle);

  })
    .catch(handleError);
};




const processPush = (z, bundle) => {

  if(bundle.inputData.content){
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

    if(bundle.inputData.content){

      delete bundle.inputData.compressedBinaryDataFileId;
      delete bundle.inputData.compressionType;
      delete bundle.inputData.fileExtension;

    }

    return getOutputInfo(z, bundle);

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

  for(let i = 0; i < body.length; i++){

    let batchItem = {};

    for(let k in bundle.inputData){
      batchItem[k] = bundle.inputData[k];
    }

    delete batchItem.orgId;
    delete batchItem.sourceId;

    if(batchContent.addOrUpdate.length >= 1){

      delete batchItem.data;
      batchItem.title = bundle.inputData.title + ' attachment #' + (i + 1) + ': ' + body[i].filename;
      batchItem.fileExtension = body[i].contentType;
      batchItem.compressedBinaryData = Buffer.from(body[i].content).toString('base64');
      batchItem.compressionType = body[i].compressionType;
      batchItem.parentId = batchContent.addOrUpdate[i].documentId;
      batchItem.documentId = bundle.inputData.documentId + '/attachment' + (i + 1);
      totalSize += body[i].size;

    } else {
      i--;
    }

    batchContent.addOrUpdate.push(batchItem);

    if(totalSize > (200 * 1024 * 1024)){
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
      batchContent.fileId = result.fileId;
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

      if (body.size > (200 * 1024 * 1024) || getStringByteSize(body.content) > (200 * 1024 * 1024)) {
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
      if(Object.keys(batchUpload).length !== 0){
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
