'use strict';

const push = require('../config').PUSH;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const messages = require('../messages');
const { handleError, fetchFile, getStringByteSize } = require('../utils');
const _ = require('lodash');


//The handler for creating a push request to Coveo. This function can be hard to follow,
//I'll do my best to explain how it operates. 
const handlePushCreation = (z, bundle) => {

  //There is no content in the File input field, no file given, so there is no reason to fetch
  //content from a url that doesn't exist. Indicate to the user that they didn't
  //put anything in the field, and continue with the push.
  if(bundle.inputData.content == null || bundle.inputData.content == undefined || bundle.inputData.content == ''){
    
    //There is no file in the bundle given, so remove the property and continue the process of 
    //sending a single item push request to Coveo.
    delete bundle.inputData.content;
    return processPush(z, bundle);

  //Something was input into the File input field, so move on.
  } else {

    //Creation of a container on amazon to store file contents. This function
    //creates the container as well as uploads to it.
    const containerInfo = createContainer(z, bundle);

    //return the creation and upload to amazon
    return containerInfo.then((result) => {

      //Push file container into the source.
      return processBatchPush(z, bundle, result);

    })
      .catch(handleError);
  }

};



//The function for sending a file container push to Coveo. Used for pushes with more than 1 file
// or a file along with plain text as a batch push.
const processBatchPush = (z, bundle, result) => {

  //Send request to Coveo
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents/batch?fileId=${result.fileId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  //Handle response from Coveo.
  return promise.then((response) => {

    if (response.status !== 202) {
      throw new Error('Error occured sending batch push request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    ///Send to responseContent handler. Could be more detailed
    //for each file sent, but that could be very overwhelming to the
    //user and require more condition handlings in the code. Just
    //giving them the normal response is sufficient enough.
    return getOutputInfo(z, bundle);

  })
    .catch(handleError);
};



//Function to send single item push to Coveo with no File input field.
//Will upload plain text content and if niether plain text nor a file is supplied,
//this will not upload any valuable content.
const processPush = (z, bundle) => {

  if(/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(bundle.inputData.data) == true){
    bundle.inputData.fileExtension = '.html';
  }

  //Send request to Coveo
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
    method: 'PUT',
    body: JSON.stringify(_.omit(bundle.inputData, ['documentId', 'orgId', 'sourceId'])),
    params: {
      documentId: bundle.inputData.documentId,
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  //Handle request response
  return promise.then((response) => {  

    if (response.status !== 202) {
      throw new Error('Error occured sending push request to Coveo: ' + z.JSON.parse(response.content).message +  ' Error Code: ' + response.status);
    }

    delete bundle.inputData.fileExtension;

    //send to responseContent handler
    return getOutputInfo(z, bundle);

  })
    .catch(handleError);
};



//The creation of a container to amazon.
const createContainer = (z, bundle) => {

  //Send request to Coveo
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/files`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  //Handle request response
  return promise.then((response) => {

    if (response.status !== 201) {
      throw new Error('Error creating file container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    //Parse the response for easier accessing of contents for the 
    //uploading function to the container.
    const result = z.JSON.parse(response.content);
    return uploadToContainer(z, bundle, result);

  })
    .catch(handleError);
};


//The function to handle a batch upload to amazon when a zip file
//is supplied in the File input field.
const uploadBatchToContainer = (z, bundle, fileContents, result) => {

  //Object to hold the addOrUpdate batch that will
  //be pushed to amazon/Coveo.
  const batchContent = {
    addOrUpdate: [],
  };

  //Total size of all the files, for backup error checking
  let totalSize = 0;

  //This is the first submission in the batch. This is needed to allow the
  //files in the batch to have a parent ID, as well as an easier method of checking
  //whether or not the data property has a value. If not, this will be removed after the files
  //have been added to the batch.
  let firstBatchItem = {};
  Object.assign(firstBatchItem, bundle.inputData);
  firstBatchItem = _.omit(firstBatchItem, 'orgId', 'sourceId');
  batchContent.addOrUpdate.push(firstBatchItem);

  fileContents.forEach((fileContent, i) => {

    //Empty batch component to be put into the batch
    let batchItem = {};

    //Scan through the bundle input information
    //and assign them to the bundle component. Metadata
    //will be included for each item pushed (should always be this since
    //the first item pushed may be deleted if it has no valuable content).
    Object.assign(batchItem, bundle.inputData);

    //No reason to keep the org and source id for the meta data, 
    //so remove them from the batch component.
    batchItem = _.omit(batchItem, 'orgId', 'sourceId');

    //The first item of the batch hasn't been processed yet, only do these after
    //the first item is created. This is because these items require parent ID's 
    //and doc ID's dependent on the first item, so they cannot be made until the
    //first one is.
    if(batchContent.addOrUpdate.length >= 1){

      delete batchItem.data;
      batchItem.title = bundle.inputData.title + ' file #' + (i + 1) + ': ' + fileContent.filename;
      batchItem.fileExtension = fileContent.contentType;
      batchItem.compressedBinaryData = Buffer.from(fileContent.content).toString('base64');
      batchItem.compressionType = fileContent.compressionType;
      batchItem.parentId = batchContent.addOrUpdate[i].documentId;
      batchItem.uri = bundle.inputData.uri + '/file' + (i + 1);
      batchItem.documentId = bundle.inputData.documentId + '/file' + (i + 1);
      totalSize += fileContent.size;

    } 

    //Add batch item to total batch
    batchContent.addOrUpdate.push(batchItem);

    //A backup error checker for the size of the files being too high
    if(totalSize >= (100 * 1024 * 1024)){
      throw new Error(messages.BIG_FILE);
    }

  });

  //If the document has zip file supplied and no plain text, the first
  //item in the batch is useless, as it will contain no data or file content.
  //No point in keeping this, so remove it. Note: deleting from this components document ID
  //will still work even if it isn't in the index (intended?).
  if(firstBatchItem.data == '' || firstBatchItem.data == undefined || firstBatchItem.data == null){
    batchContent.addOrUpdate.splice(0, 1);
  } else if(/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(firstBatchItem.data) == true){
    firstBatchItem.fileExtension = '.html';
  }

  //Amazon doesn't get mad about no content-length headers for this upload for some reason,
  //very strange. This has potential to break in the future.
  let headers = result.requiredHeaders;

  //Send upload request to amazon
  const promise = z.request({
    url: result.uploadUri,
    method: 'PUT',
    body: batchContent,
    headers: headers,
  });

  //Handle amazon response
  return promise.then((response) => {

    if (response.status !== 200) {
      throw new Error('Error uploading file contents to container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    //Get result and return it, should be an empty object
    const result = z.JSON.stringify(response.content);
    return result;

  })
    //After successful upload
    .then(() => {
      //The file container ID is needed for the next stage of pushign the container
      //and its contents to Coveo, so append it to the batchContent for reference and return.
      batchContent.fileId = result.fileId;
      return batchContent;
    })
    .catch(handleError);
};



//Function to handle the uploading of the file contents into
//the container that was created. 
const uploadToContainer = (z, bundle, result) => {

  const upload = {
    addOrUpdate: [],
  };

  //Empty object that a batch will be put in if one exists
  let batchUpload = {};
  let file = bundle.inputData.content;

  //Fetch the contents of the file given in the File field.
  const fileDetails = fetchFile(file);

  //Returned the file contents successfully, now handle them
  return fileDetails.then((fileContents) => {

    //If the returned response was a zip file, this means the returned contents
    //will have a length greater than 0 in them. If that is the case, use the empty
    //object from earlier to store the result from the function handling batch uploading.
    //Skip the rest of the function from here.
    if(fileContents.length > 0){

      batchUpload = uploadBatchToContainer(z, bundle, fileContents, result);

    //single item to push handle
    } else {

      let contentNumber = 0;

      while(contentNumber != 2){

        let uploadContent = {};

        //Scan through the bundle input information
        //and assign them to the bundle component. Metadata
        //will be included for each item pushed (should always be this since
        //the first item pushed may be deleted if it has no valuable content).
        Object.assign(uploadContent, bundle.inputData);

        //No reason to keep the org and source id for the meta data, 
        //so remove them from the batch component.
        uploadContent = _.omit(uploadContent, 'orgId', 'sourceId');

        //The first item of the batch hasn't been processed yet, only do these after
        //the first item is created. This is because these items require parent ID's 
        //and doc ID's dependent on the first item, so they cannot be made until the
        //first one is.
        if(upload.addOrUpdate.length >= 1){

          delete uploadContent.data;
          uploadContent.title = bundle.inputData.title + ' file: ' + fileContents.filename;
          uploadContent.fileExtension = fileContents.contentType;
          uploadContent.compressedBinaryData = Buffer.from(fileContents.content).toString('base64');
          uploadContent.compressionType = 'UNCOMPRESSED';
          uploadContent.parentId = upload.addOrUpdate[contentNumber - 1].documentId;
          uploadContent.uri = bundle.inputData.uri + '/file1';
          uploadContent.documentId = bundle.inputData.documentId + '/file1';

        }
        
        upload.addOrUpdate.push(uploadContent);
        contentNumber++;

      }

      //This is a backup error checker for the size of the file.
      if (fileContents.size >= (100 * 1024 * 1024) || getStringByteSize(fileContents.content) >= (100 * 1024 * 1024)) {
        throw new Error(messages.BIG_FILE);
      }

      //If the document has zip file supplied and no plain text, the first
      //item in the batch is useless, as it will contain no data or file content.
      //No point in keeping this, so remove it. Note: deleting from this components document ID
      //will still work even if it isn't in the index (intended?).
      if(upload.addOrUpdate[0].data == '' || upload.addOrUpdate[0].data == undefined || upload.addOrUpdate[0].data == null){
        upload.addOrUpdate[1].title = fileContents.filename;
        upload.addOrUpdate.splice(0, 1);
      } else if(/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(upload.addOrUpdate[0].data) == true){
        upload.addOrUpdate[0].fileExtension = '.html';
      }

      let headers = result.requiredHeaders;

      //Send request to upload the file to amazon
      const promise = z.request({
        url: result.uploadUri,
        method: 'PUT',
        body: upload,
        headers: headers,
      });

      //Handle the response from amazon
      return promise.then((response) => {

        if (response.status !== 200) {
          throw new Error('Error uploading file contents to container: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
        }

        //Get the content and return it, should be an empty object.
        const result = z.JSON.stringify(response.content);
        return result;
      })
        .catch(handleError);
    }
  })
    //After the upload succeeds
    .then(() => {
      //If the batchUpload object has anything in it, then a zip/tar file
      //batch push was used instead of a single item push. If this is the case,
      //return that object. Return the details gathered for a single, non-archive push
      //otherwise.
      if(Object.keys(batchUpload).length !== 0){
        return batchUpload;
      } else {
        upload.fileId = result.fileId;
        return upload;
      }
    })
    .catch(handleError);
};

module.exports = {
  handlePushCreation,
};
