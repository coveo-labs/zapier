'use strict';

const push = require('../config').PUSH;
const getOutputInfo = require('./responseContent').getOrgInfoForOutput;
const fileHandler = require('./fileHandler').fileHandler;
const { handleError, coveoErrorHandler, validateCompressionType, getStringByteSize, setSourceStatus, validateFileCount, validateFileSize } = require('../utils');

//Regular expression checker for the 'data' property of a push being an html body or not.
//This is needed to change the fileExtension to html if needed. 
const RE_IS_HTML = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i;

//The handler for creating a push request to Coveo.
const handlePushCreation = (z, bundle) => {
  //No file given, so there is no reason to fetch content from a url that doesn't exist.
  if (!bundle.inputData.content) {
    //There is no file in the bundle given, so remove the property and continue the process of
    //sending a single item push request to Coveo.
    delete bundle.inputData.content;
    return processPush(z, bundle);

  } else {
    //Creation of a container on amazon to store file contents. This function
    //creates the container as well as uploads to it. Depending on what kind of file
    //is detected when fetching content, the uploading method changes slightly.
    //See the uploading functions on how/why there's a difference
    const containerInfo = createContainer(z, bundle);

    //Return the creation and upload to amazon
    return containerInfo
      .then(result => {
        //Push file container into the source. this indexes the content of the submission.
        return processBatchPush(z, bundle, result);
      })
      .catch(handleError);
  }
};

//The function for sending a file container push to Coveo. Used for pushes that have file contents extracted from them
//or a file along with plain text as a batch push.
const processBatchPush = (z, bundle, result) => {
  //Set te status of the source before any push is sent to it
  const statePromise = setSourceStatus(z, bundle, 'INCREMENTAL');

  return statePromise.then(() => {

  //Send request to Coveo
    const batchPushPromise = z.request({
      url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents/batch?fileId=${result}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    //Handle response from Coveo.
    return batchPushPromise
      .then(response => {
        if (response.status !== 202) {
          coveoErrorHandler(response.status);
        }

        //Set the status of the source back once the push has succeeded
        return setSourceStatus(z, bundle, 'IDLE');
      })
      .then(() => {
      ///Send to responseContent handler.
        return getOutputInfo(z, bundle);
      })
      .catch(handleError);
  })
    .catch(handleError);
};

//Function to send single item push to Coveo with no File input field.
//Will upload plain text content and if neither plain text nor a file is supplied,
//this will not upload any valuable content.
const processPush = (z, bundle) => {
  //Set te status of the source before any push is sent to it
  const statePromise = setSourceStatus(z, bundle, 'INCREMENTAL');

  //Check for any HTML tags in the data if it exists, and change the fileExtension to
  //.html so it is indexed properly
  if (RE_IS_HTML.test(bundle.inputData.data)) {
    bundle.inputData.fileExtension = '.html';
  }

  return statePromise.then(() => {

  //Send request to Coveo.
    const singleItemPushPromise = z.request({
      url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
      method: 'PUT',
      body: JSON.stringify(bundle.inputData),
      params: {
        documentId: bundle.inputData.documentId,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    //Handle request response
    return singleItemPushPromise
      .then(response => {
        if (response.status !== 202) {
          coveoErrorHandler(response.status);
        }

        //Set the status of the source back once the push has succeeded
        return setSourceStatus(z, bundle, 'IDLE');
      })
      .then(() => {
      //Don't need this for output info, so remove it
        delete bundle.inputData.fileExtension;

        //Send to responseContent handler
        return getOutputInfo(z, bundle);
      })
      .catch(handleError);
  })
    .catch(handleError);
};

//The creation of a container to amazon.
const createContainer = (z, bundle) => {
  //Send request to Coveo
  const containerPromise = z.request({
    url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/files`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  //Handle request response
  return containerPromise
    .then(response => {
      if (response.status !== 201) {
        coveoErrorHandler(response.status);
      }

      //Parse the response for easier accessing of contents for the
      //uploading function to the container.
      const result = z.JSON.parse(response.content);
      return uploadToContainer(z, bundle, result);
    })
    .catch(handleError);
};

//The function to handle a batch upload to amazon with multiple
//inputs in the Files input field.
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
  batchContent.addOrUpdate.push(firstBatchItem);

  fileContents.forEach((fileContent, i) => {
    let batchItem = {};

    //Scan through the bundle input information
    //and assign them to the bundle component. Metadata
    //will be included for each item pushed (should always be this since
    //the first item pushed may be deleted if it has no valuable content).
    Object.assign(batchItem, bundle.inputData);

    //The first item of the batch hasn't been processed yet, only do these after
    //the first item is created. This is because these items require parent ID's
    //and doc ID's dependent on the first item, so they cannot be made until the
    //first one is.
    if (batchContent.addOrUpdate.length >= 1) {

      delete batchItem.data;
      batchItem.title = decodeURI(fileContent.filename); //Some apps encode the title, this gets rid of that
      batchItem.compressedBinaryData = Buffer.from(fileContent.content).toString('base64');
      batchItem.compressionType = fileContent.compressionType;
      batchItem.parentId = batchContent.addOrUpdate[0].documentId;
      batchItem.documentId = batchContent.addOrUpdate[0].documentId + '/file' + (i + 1);
      totalSize += parseInt(fileContent.size); //Some apps set the size toa  string, this converts it to an integer

      //If there is no extension for the file, don't put that property in
      //the batch push. Let the indexer try and figure it out.
      if(fileContent.contentType !== ''){
        batchItem.fileExtension = fileContent.contentType;
      }

      //Call compression checker to get the compression type of the file
      batchItem.compressionType = validateCompressionType(fileContent);
    }
    //Add batch item to total batch
    batchContent.addOrUpdate.push(batchItem);

    //A backup error checker for the size of the files being too high
    validateFileSize(totalSize);
  });

  //If the parent document has no plain text, the parent document
  //item in the batch is useless, as it will contain no data or file content, so remove it.
  if (!firstBatchItem.data) {
    batchContent.addOrUpdate.splice(0, 1);
  }
  //Check for any HTML tags in the data if it exists, and change the fileExtension to .html so it is indexed properly
  else if (RE_IS_HTML.test(firstBatchItem.data)) {
    batchContent.addOrUpdate[0].fileExtension = '.html';
  }

  //Amazon doesn't get mad about no content-length headers for this upload,
  //very strange. This has potential to break in the future. Don't put the header
  //if it isn't needed, as the excess headers can also break this.
  let headers = result.requiredHeaders;

  //Send upload request to amazon
  const uploadPromise = z.request({
    url: result.uploadUri,
    method: 'PUT',
    body: batchContent,
    headers: headers,
  });

  //Handle amazon response
  return uploadPromise
    .then(response => {
      if (response.status !== 200) {
        coveoErrorHandler(response.status);
      }
      //The container file ID is needed for the next stage of pushing the container
      //and the batch contents aren't needed as they've been uploaded to the container.
      //So, just return the file ID.
      return result.fileId;
    })
    .catch(handleError);
};

//Function to handle the uploading of the file contents into
//the container that was created depending on the type of
//file that content was fetched and how many files were requested for fetching.
const uploadToContainer = (z, bundle, result) => {
  const upload = {
    addOrUpdate: [],
  };

  let batchUpload = {};
  let files = bundle.inputData.content;

  //Fetch the contents of the files given in the File field.
  const fileDetails = fileHandler(files, bundle);

  //Returned the file contents successfully, now handle them
  return (
    fileDetails
      .then(fileContents => {
        //Too many files if a batch was set up, throw an error
        validateFileCount(fileContents.length);

        //If the returned response has more than just 1 file, this means the returned contents
        //will have a length greater than 1 in them. If that is the case, use the empty
        //object from earlier to store the result from the function handling batch uploading.
        //Skip the rest of the function from here.
        if (Object.keys(fileContents).length > 1) {
          batchUpload = uploadBatchToContainer(z, bundle, fileContents, result);
        }
        // Single file to push handle and also handles plain text with a single file
        else {
          let contentNumber = 0;
          
          //This only needs to iterate twice, but manually coding out each component of the push
          //would look and be ugly. So, better to just have a two loop iteration to handle it
          //similar to the one in the uploadBatch function
          while (contentNumber !== 2) {
            let uploadContent = {};

            //Scan through the bundle input information
            //and assign them to the bundle component. Metadata
            //will be included for each item pushed (should always be this since
            //the first item pushed may be deleted if it has no valuable content).
            Object.assign(uploadContent, bundle.inputData);

            //The first item of the batch hasn't been processed yet, only do these after
            //the first item is created. This is because these items require parent ID's
            //and doc ID's dependent on the first item, so they cannot be made until the
            //first one is.
            if (upload.addOrUpdate.length >= 1) {

              delete uploadContent.data;
              uploadContent.title = decodeURI(fileContents[0].filename);
              uploadContent.compressedBinaryData = Buffer.from(fileContents[0].content).toString('base64');
              uploadContent.parentId = upload.addOrUpdate[0].documentId;
              uploadContent.documentId = upload.addOrUpdate[0].documentId + '/file1';

              //If no extension is present, don't provide that property in the push. Try
              //and let the indexer figure it out if it can.
              if(fileContents.contentType !== ''){
                uploadContent.fileExtension = fileContents[0].contentType;
              }

              //Call compression checker to get the compression type of the file
              uploadContent.compressionType = validateCompressionType(fileContents[0]);
            }

            //Push onto the batch
            upload.addOrUpdate.push(uploadContent);
            contentNumber++;

          }

          //This is a backup error checker for the size of the file.
          validateFileSize(fileContents[0].size || getStringByteSize(fileContents[0].content));

          //If the document has a file supplied and no plain text, the first
          //item in the batch is useless, as it will contain no data or file content, so remove it.
          if (!upload.addOrUpdate[0].data) {
            delete upload.addOrUpdate[1].parentId;
            upload.addOrUpdate[1].documentId = bundle.inputData.documentId;
            upload.addOrUpdate.splice(0, 1);
          }
          //Check for any HTML tags in the data if it exists, and change the fileExtension to
          //.html so it is indexed properly
          else if (RE_IS_HTML.test(upload.addOrUpdate[0].data)) {
            upload.addOrUpdate[0].fileExtension = '.html';
          }

          let headers = result.requiredHeaders;

          //Send request to upload the file to amazon
          const uploadPromise = z.request({
            url: result.uploadUri,
            method: 'PUT',
            body: upload,
            headers: headers,
          });

          //Handle the response from amazon
          return uploadPromise
            .then(response => {
              if (response.status !== 200) {
                coveoErrorHandler(response.status);
              }

              //Get the content and return it, should be an empty object.
              //Just need to return something in order to continue on to the next
              //step where what this function returns as a whole.
              const result = z.JSON.stringify(response.content);
              return result;
            })
            .catch(handleError);
        }
      })
      //After the upload succeeds
      .then(() => {
        //If the batchUpload object has content, multiple files were fetched from. If this is the case,
        //return that object by calling that upload handler. Only need the file id of the container in order
        //to continue from here, so just return that.
        if (Object.keys(batchUpload).length) {
          return batchUpload;
        }
        return result.fileId;
      })
      .catch(handleError)
  );
};

module.exports = {
  handlePushCreation,
};