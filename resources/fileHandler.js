'use strict';

const { getStringByteSize, handleError, validateCompressionType, validateFetch, validateFileCount, validateFileSize, validateArchiveType, archiveFileNameFilter, findExtension, findFilename } = require('../utils');

//This function handles the process of fetching all the files provided
//in the Field input field. All files will have content extracted, if they don't
//violate absolute url form or have content, and then indexed into the source.
const fileHandler = (files, bundle) => {
  //List of promises, content of all the files, total files, and 
  //and index tracker for updating the bundle for better response content later on.
  let fileFetches = [];
  let fileContents = [];
  let fileCount = 0;
  let indexCount = -1;
  
  //Set up promises to fetch each file supplied
  files.forEach(file => {
    fileFetches.push(fetchFile(file));
  });
  
  //Return all the promises
  return Promise.all(fileFetches)
    .then(function(fileContent){
      //For each result of the fetch...
      fileContent.forEach(content => {
        //Get the file name and type, iterate index once.
        let filename = decodeURI(content.filename); //Fixes bug where some apps encode file names
        let fileType = 'A(n) ' + content.contentType;
        indexCount++;
  
        //If an archive file was fetched, do this
        if(content.length && !content.fetch){
  
          //Update the filename and type to be more response friendly for later
          filename = 'Contents of ' + decodeURI(content.originalFileInfo.filename);
          fileType = 'Contents of a ' + content.originalFileInfo.fileType;
  
          //For each file in the archive file
          content.forEach(subContent => {
  
            //Save the file info and iterate the file count 
            fileContents.push(subContent);
            fileCount++;
  
            //Too many files checker
            validateFileCount(fileCount);
  
          });
  
          //If a non-archive file is being looked at
        } else if (content.fetch){
          //Get the content of the file and iterate the file count
          fileContents.push(content);
          fileCount++;

          //Too many files checker
          validateFileCount(fileCount);
        }
        
        //If the content fetched was bad (not the initial desired content)
        if (!content.fetch){
  
          //Remove the content from the data, as it isn't important or useful
          bundle.inputData.content.splice(indexCount, 1);
          indexCount--;
  
          //If a good fetch happened
        } else if (content.length){
  
          //If the file name existed in the file information, set the
          //filename to be more response friendly, same for file type.
          //This is for archive files only.
          if(filename !== 'Content of '){
            bundle.inputData.content[indexCount] = filename;
          } else if (fileType !== 'Contents of a '){
            bundle.inputData.content[indexCount] = fileType + ' file';
          } else {
            bundle.inputData.content[indexCount] = 'A file';
          }
  
        } else {
  
          //If the file name existed in the file information, set the
          //filename to be more response friendly, same for file type.
          //This is for non-archive files only.
          if(filename !== ''){
            bundle.inputData.content[indexCount] = filename;
          } else if(fileType != 'A(n) '){
            bundle.inputData.content[indexCount] = fileType + ' file';
          } else {
            bundle.inputData.content[indexCount] = 'A file';
          }
  
        }
      });
  
      return fileContents;
    })
    .catch(handleError);
};


//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url for files, or urls in general).
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If a supported archive
//file is sent for batch pushing, see decompressArchive.
const fetchFile = url => {
  const fetch = require('node-fetch');
  
  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };
  
  let fetchResponse = '';

  //If the url is not absolute, fetch will fail. Prevent the error here
  //and from breaking the Zap by just not fetching any content from it
  if(!validateFetch(url)){
      
    details.fetch = false;
    return details;
  
  } else {
  
    return fetch(url)
      .then(response => {
        fetchResponse = response;

        //Check if the url content was extracted from was the url that was intended for content extraction.
        details.fetch = validateFetch(url, response);
  
        const disposition = response.headers.get('content-disposition');
        details.size = response.headers.get('content-length');
        details.filename = findFilename(disposition, response);
  
        //Return the promise/buffer of the file
        return response.buffer();
      })
      .then(content => {
        details.content = content;
        details.contentType = findExtension(details, fetchResponse);

        //The file is too big (100 MB for now), throw an error telling
        //the user so and the file size limit.
        validateFileSize(details.size, details.content);
  
        //See if the file is a supported archive or not, handle
        //accordingly.
        if(validateArchiveType(details)){
          return decompressArchive(details);
        }

        //If neither the zip or tar cases picked up anything, this is some single file
        //type, like pdf, or a file type that isn't supported (in which no valuable content will be extracted in the source)
        //and Coveo may or may not delete the submission.
        return details;
      })
      .catch(handleError);
  }
};

//This function is to allow for types of archive files to be used in a push. Includes .zip, .tar, .tar.gz, or .tar.bz2 (and their short hands).
//This can be expanded upon in the future, but encompassing all archive file types would be very labor intensive.
const decompressArchive = details => {
  let addOrUpdate = [];
  
  //This is all for decompressing the contents of the supported archive files See: https://www.npmjs.com/package/decompress
  const decompress = require('decompress'); 
  
  //Decompress and get the contents of the supported archive file types.
  //This will fail if a tar header is corrupt or not present and zip will always succeed unless corrupt.
  const toConvert = decompress(details.content, {
    inputFile: details.content,
  });
  
  return toConvert.then(files => {
    //Keep track of the total files and size  
    //Also, set up method for storing and folder names.
    let fileCount = 0;
    let folderNames = [];
    let totalFileSize = 0;
  
    //Loop through the file contents and grab the important components.
    files.forEach(file => {
      let archiveContent = {};
  
      //These files are macOS dependent or hidden files that don't have any valuable content to extract, so ignore them.
      if (archiveFileNameFilter(file, folderNames)) {
        //Also ignore folders within the archive, but keep folder names
        //to help alter the file names within them.
      } else {

        //Get the file type/extension for the file info
        archiveContent.contentType = findExtension(file);
  
        //Get important file info from each file in the archive
        archiveContent.size = getStringByteSize(file.data);
        archiveContent.content = file.data;
        archiveContent.filename = file.path;
        totalFileSize += archiveContent.size;
        fileCount++;
  
        //Too many files or the contents of the archive
        //are too big, so catch early and throw an error
        validateFileCount(fileCount);
        validateFileSize(totalFileSize, archiveContent.content);
  
        //If a file is in a folder, the file name includes the folder's name
        //as well. Remove the excess folder name out of the file name.
        folderNames.forEach(folderName => {
          if (archiveContent.filename.indexOf(folderName) > -1) {
            archiveContent.filename = file.path.substr(folderName.length, file.path.length);
          }
        });
  
        //Get the compression type of the individual file in the zip file
        archiveContent.compressionType = validateCompressionType(archiveContent, archiveContent.size);
  
        //Push the file information into the array to be handled later
        addOrUpdate.push(archiveContent);
  
      }
    });
  
    //Save the original file type for the sake of output and return
    addOrUpdate.originalFileInfo = details;
    return addOrUpdate;
  })
    .catch(handleError);
};

module.exports = {
  fileHandler,
};