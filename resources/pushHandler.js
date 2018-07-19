'use strict';

const push = require('../config').PUSH;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const fileTooBig = require('../messages').BIG_FILE;
const handleError = require('../utils').handleError;
const fetchFileDetails = require('../utils').fetchFile;
const getStringByteSize = require('../utils').getStringByteSize;
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

      //This property of the result can only exist if a zip file was put into
      //the File input field, the contents were successfully fetched, extracted,
      //and uploaded to the container created. If this is the case, a different request must
      //be made to Coveo to push a file container into the source.
      if(result.addOrUpdate){

        //Push file container into the source, batch pushes only occur
        //with zip files.
        return processZipBatchPush(z, bundle, result);

      //The successful file fetch wasn't a zip file, meaning it was
      //only one file. There's no need to push a container for one file,
      //so move on to pushing a single item.
      } else {

        //Assign the bundle the correct components needed for Coveo to
        //properly index the file. Will be uncompressed by default.
        bundle.inputData.compressedBinaryDataFileId = result.fileId;
        bundle.inputData.compressionType = 'UNCOMPRESSED';
        bundle.inputData.fileExtension = result.contentType;

        //If a zip file contained one file, just change the
        //compression type to DEFLATE. 
        if(result.originalContentType === '.zip'){
          bundle.inputData.compressionType = 'DEFLATE';
        }

        //Continue on to creating a single item push to Coveo.
        return processPush(z, bundle);

      }

    })
      .catch(handleError);
  }

};



//The function for sending a file container push to Coveo. Used for zip files with more than 1 file
//as a batch push.
const processZipBatchPush = (z, bundle, result) => {

  //Send request to Coveo
  const promise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents/batch?fileId=${result.fileId}`,
    method: 'PUT',
    body: {},
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



//Function to send single item push to Coveo.
const processPush = (z, bundle) => {

  //If the inputData has content that is valid (passed the fetch and got valid content of
  //a file), and the bundle has plain text input data, the file contents override the plain text.
  //If a user submits plain text about a single file, that we have all the content about, there is no
  //real value in indexing both of them into the source.
  if(bundle.inputData.content && bundle.inputData.data != undefined){
    delete bundle.inputData.data;
  }

  //Send request to Coveo
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

  //Handle request response
  return promise.then((response) => {

    if (response.status !== 202) {
      throw new Error('Error occured sending push request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    //If there was a file extracted in the request, remove the unecessary information the
    //user doesn't need to see in the output in Zapier. 
    if(bundle.inputData.content){

      bundle.inputData = _.omit(bundle.inputData, 'compressedBinaryDataFileId', 'compressionType', 'fileExtension');

    }

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

  //Handle rrequest response
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
const uploadZipBatchToContainer = (z, bundle, fileContents, result) => {

  //Object to hold the addOrUpdate batch that will
  //be pushed to amazon/Coveo.
  const batchContent = {
    addOrUpdate: [],
  };

  //Total size of all the files, for backup error checking
  let totalSize = 0;

  for(let i = 0; i < fileContents.length; i++){

    //Empty batch component to be put into the batch
    let batchItem = {};

    //Scan through the bundle input information
    //and assign them to the bundle component. Metadata
    //will be included for each item pushed (should always be this since
    //the first item pushed may be deleted if it has no valuable content).
    for(let k in bundle.inputData){
      batchItem[k] = bundle.inputData[k];
    }

    //No reason to keep the org and source id for the meta data, 
    //so remove them from the batch component.
    batchItem = _.omit(batchItem, 'orgId', 'sourceId');

    //The first item of the batch hasn't been processed yet, only do these after
    //the first item is created. This is because these items require parent ID's 
    //and doc ID's dependent on the first item, so they cannot be made until the
    //first one is.
    if(batchContent.addOrUpdate.length >= 1){

      delete batchItem.data;
      batchItem.title = bundle.inputData.title + ' attachment #' + (i + 1) + ': ' + fileContents[i].filename;
      batchItem.fileExtension = fileContents[i].contentType;
      batchItem.compressedBinaryData = Buffer.from(fileContents[i].content).toString('base64');
      batchItem.compressionType = fileContents[i].compressionType;
      batchItem.parentId = batchContent.addOrUpdate[i].documentId;
      batchItem.documentId = bundle.inputData.documentId + '/attachment' + (i + 1);
      totalSize += fileContents[i].size;

    //The first item is currently being processed, so reduce the loop counter by 1
    //in order to start at the first item in the fileContents.
    } else {
      i--;
    }

    //Add batch item to total batch
    batchContent.addOrUpdate.push(batchItem);

    //A backup error checker for the size of the files being too high
    if(totalSize >= (100 * 1024 * 1024)){
      throw new Error(fileTooBig);
    }

  }

  //If the document has zip file supplied and no plain text, the first
  //item in the batch is useless, as it will contain no data or file content.
  //No point in keeping this, so remove it. Note: deleting from this components document ID
  //will still work even if it isn't in the index (intended?).
  if(bundle.inputData.data == '' || bundle.inputData.data == undefined || bundle.inputData.data == null){
    batchContent.addOrUpdate.splice(0, 1);
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

  //Information that is helpful for the function and
  //returned for other functions.
  const containerInfo = {
    fileId: result.fileId,
    contentType: '',
    originalContentType: '',
  };

  //Empty object that a batch will be put in if one exists
  let batchUpload = {};
  let file = bundle.inputData.content;

  //Fetch the contents of the file given in the File field.
  const fileDetails = fetchFileDetails(file);

  //Returned the file contents successfully, now handle them
  return fileDetails.then((fileContents) => {

    //If the returned response was a zip file, this means the returned contents
    //will have a length greater than 0 in them. If that is the case, use the empty
    //object from earlier to store the result from the function handling batch uploading.
    //Skip the rest of the function from here.
    if(fileContents.length > 0){

      batchUpload = uploadZipBatchToContainer(z, bundle, fileContents, result);

    //single item to push handle
    } else {

      //Get the file's type and original type (if zip) and save them.
      containerInfo.contentType = fileContents.contentType;
      containerInfo.originalContentType = fileContents.originalContentType;

      //This is a backup error checker for the size of the file.
      if (fileContents.size >= (100 * 1024 * 1024) || getStringByteSize(fileContents.content) >= (100 * 1024 * 1024)) {
        throw new Error(fileTooBig);
      }

      //Amazon sometimes doesn't like it when you don't sent a content-length header,
      //so create one here. If this isn't supplied, timeouts or header errors can occur.
      //How z.request interacts with amazon seems to cause this.
      let headers = result.requiredHeaders;
      headers['content-length'] = fileContents.size;

      //If the size wasn't grabbed successfully, get the size from the buffer
      if(headers['content-length'] == null){
        headers['content-length'] = getStringByteSize(fileContents.content);
      }

      //Send request to upload the file to amazon
      const promise = z.request({
        url: result.uploadUri,
        method: 'PUT',
        body: fileContents.content,
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
    //After the uplaod succeeds
    .then(() => {
      //If the batchUpload object has anything in it, then a zip file
      //batch push was used instead of a single item push. If this is the case,
      //return that object. Return the details gathered for a single item push
      //otherwise.
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
