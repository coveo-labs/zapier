'use strict';

const tooManyFiles = require('./messages').TOO_MANY_FILES;
const badFetch = require('./messages').BAD_FETCH;
const fileTooBig = require('./messages').BIG_FILE;
const path = require('path');

//Simple function to handle an error occuring in a function that I didn't catch.
//For instance, an error in grabbing the index of an array out of bounds would be caught by this.
const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error('Error occured during processing: ' + error);
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

    //Filter out hidden files. Coveo can't really extract anything from these and some users
    //may prefer not to have their hidden files pushed into an index.
    let names = Object.keys(zip.files).filter(file => !(/(^|\/)\.[^\/\.]/g).test(file));

    //Track folder names and number of files currently prepped for upload. Also
    //track total file size so the user doesn't send files that are too big.
    let folderNames = [];
    let fileCount = 0;
    let totalFileSize = 0;

    for(let i = 0; i < names.length; i++){

      let zipContent = {};

      //These files are macOS dependent and don't have any valuable content for
      //Coveo to extract, so ignore them.
      if(names[i].indexOf('__MACOSX/') > -1){
        //Also ignore folders within the zip file, just want their contents not the folders themselves, but keep folder names
        //to help alter the file names within it.
      } else if(zip.files[names[i]].dir == true){

        folderNames.unshift(names[i]);

      } else {

        //Extract important details for the files here
        zipContent.size = zip.files[names[i]]._data.compressedSize;
        totalFileSize += zipContent.size;
        zipContent.contentType = path.extname(names[i]);
        zipContent.filename = names[i];

        //The files are too big (100 MB for now), throw an error telling
        //the user so and the file size limit.
        if(totalFileSize >= (100 * 1024 * 1024)){
          throw new Error(fileTooBig);
        }

        zipContent.content = zip.files[names[i]]._data.compressedContent;
        fileCount++;

        //Set limit on number of documents that a zip file can contain in order to avoid
        //customers sending hundreds of files at once and crashing services. Currently set at 50.
        if(fileCount > 50){
          throw new Error(tooManyFiles);
        }

        //If a file is in a folder, the file name includes the folder's name
        //as well. This looks at the encountered folders so far and removes
        //the excess folder name out of the file name.
        for(let k in folderNames){

          if(zipContent.filename.indexOf(folderNames[k]) > -1){

            zipContent.filename = names[i].substr(folderNames[k].length, names[i].length);

          }

        }

        //The sometimes extension for files can be screwed up by how Zapier handles zip files. Not sure if
        //null is possible, so I put it in just to be safe.
        if(zipContent.contentType === 'undefined' || zipContent.contentType === 'null' || zipContent.contentType === ''){
          zipContent.contentType = '.' + names[i].split('/')[1].split(';')[0];
        }

        //If the data is in a zip but not compressed, give it the uncompressed data compression,
        //otherwise it is deflate for zip. Check the first few bits to see if other algorithms used
        //before defaulting to deflate. Best way to deal with this for now...
        if(zipContent.size == zip.files[names[i]]._data.uncompressedSize){
          zipContent.compressionType = 'UNCOMPRESSED';
        } else if(zipContent.content[0] == 31 && zipContent.content[1] == 139 && zipContent.content[2] == 8) {
          zipContent.compressionType = 'GZIP';
        } else if (((zipContent.content[0] * 256) + zipContent.content[1]) % 31 == 0){
          zipContent.compressionType = 'ZLIB';
        } else if (details.content[0] == 80 && details.content[1] == 75 && details.content[2] == 3 && details.content[3] == 4){
          zipContent.compressionType = 'DEFLATE';
        } else {
          zipContent.compressionType = 'LZMA';
        }
        
        addOrUpdate.push(zipContent);

      }

    }

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
        throw new Error(badFetch);
      }

      
      details.size = response.headers.get('content-length');
      const disposition = response.headers.get('content-disposition');

      //The file is too big (100 MB for now), throw an error telling
      //the user so and the file size limit.
      if(details.size >= (100 * 1024 * 1024)){
        throw new Error(fileTooBig);
      }

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
