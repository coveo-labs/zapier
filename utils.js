'use strict';

const messages = require('./messages');
const path = require('path');

//Simple function to handle an error occurring in a function that wasn't explicitly caught.
const handleError = error => {
  if (typeof error === 'string') {
    throw new Error('Error occurred during processing: ' + error);
  }

  throw error;
};

//This function is to allow for a few more types of archive files to be used instead of just a zip file. Includes .tar, .tar.gz, or .tar.bz2 (and their short hands).
//This function takes the contents and transforms them into a zip file buffer, then sends off to the zip file handler to process. It'd be a waste to completely erase the
//zipHandler method, since it uses JSZip which is very useful for getting file details. This can be expanded upon in the future, but encompassing all archive file types would be very labor intensive.
const convertToZip = details => {
  let archiveFile = details;

  //This is all for decompressing the contents of the files See: https://www.npmjs.com/package/decompress
  const decompress = require('decompress'); //Look for alternative for getting all of the contents of all tar file types, as of now there are no good tar readers from a buffer, only local files
  const zip = require('node-native-zip'); //Consider swapping to this in the future: https://github.com/archiverjs/node-archiver

  //Create new zip archive, and decompress the contents
  //of the supplied tar archive. This will fail if the tar header is corrupt or not present.
  //Supports .bz2, .gz, and .tar (decompress module doesn't support .Z/.lz and .xz/.lzma is bugged).
  let newArchive = new zip();
  const toConvert = decompress(archiveFile.content, {
    inputFile: archiveFile.content,
  });

  return toConvert.then(files => {
    let fileCount = 0;

    //Loop through the file contents and add them to the new zip archive
    //with the file names and buffers associated with them.
    files.forEach(file => {
      //Ignore folders in the total file count; 
      //don't care about indexing folders.
      if (file.type !== 'directory') {
        fileCount++;
      }

      //Too many files in archive, catch early and throw an error
      if (fileCount > 50) {
        throw new Error(messages.TOO_MANY_FILES);
      }

      newArchive.add(file.path, file.data);
    });
    //Turn the entire zip in a zip file buffer, and send off to the
    //zip file handler.
    archiveFile.content = newArchive.toBuffer();
    return handleZip(archiveFile);
  });
};

//This is a function to determine the type of compression used on a file. If none of these are detected, it will be indexed with whichever default it gets.
//If the data is in a zip but not compressed, give it the uncompressed data compression, otherwise it is deflate for zip. If no uncompressedSize is provided in the parameters, a zip file is not 
//being looked at, so default to uncompressed.
//Used this as a reference: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe for compression detecting.
//You can go directly the file format headers for these types of compression to find out the headers.
const findCompressionType = (zipContent, uncompressedSize) => {

  //Default
  let compressionType = 'UNCOMPRESSED';

  //If coming from a zipHandler, default to deflate instead
  if(uncompressedSize){
    compressionType = 'DEFLATE';
  }

  const c = zipContent.content;

  //Check first few bytes of the buffer to get compression, except LZMA
  //as the structure for these isn't very consistent globally to check for each time
  //and is very taxing to determine without a handy module.
  if (c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) {
    compressionType = 'GZIP';
  } else if ((c[0] * 256 + c[1]) % 31 === 0) {
    compressionType = 'ZLIB';
  } else if (c[0] === 0x78 && (c[1] === 1 || c[1] === 0x9c || c[1] === 0xda)){
    compressionType = 'DEFLATE';
  } else if (zipContent.size === uncompressedSize) {
    compressionType = 'UNCOMPRESSED';
  } else if (zipContent.filename.indexOf('.lzma') > 0 || zipContent.contentType === '.bin') { //Mime-types checker defaults to this, as no lzma mime exists in it
    compressionType = 'LZMA';
  }

  return compressionType;

};

//This is the handler for extracting all the files within a zip file or converted tar file. Extracts the files important features
//for pushing to Coveo (sizes, content of files, file types, file names).
const handleZip = details => {
  const addOrUpdate = [];

  const JSZIP = require('jszip');
  const zip = new JSZIP();

  //Get the contents of the zip buffer to get the details
  const zipFile = zip.loadAsync(details.content);

  return zipFile.then(zip => {
    //Filter out hidden files. Coveo can't really extract anything from these and generally users
    //prefer not to have their hidden files pushed and most hidden files aren't useful content wise.
    let names = Object.keys(zip.files).filter(file => !/(^|\/)\.[^/.]/g.test(file));

    //Track folder names and number of files currently prepped for upload. Also
    //track total file size so the user doesn't send files that are too big.
    let folderNames = [];
    let fileCount = 0;
    let totalFileSize = 0;

    //Iterate through each file in the zip
    names.forEach(name => {
      let zipContent = {};

      // These files are macOS dependent and don't have any valuable content for Coveo to extract, so ignore them.
      if (name.indexOf('__MACOSX/') > -1) {
        //Also ignore folders within the zip file, just want their contents not the folders themselves, but keep folder names
        //to help alter the file names within it.
      } else if (zip.files[name].dir) {
        folderNames.unshift(name);
      } else {
        //Extract important details for the files here
        zipContent.size = zip.files[name]._data.compressedSize;
        totalFileSize += zipContent.size;
        zipContent.contentType = path.extname(name);
        zipContent.filename = name;

        //The files are too big (100 MB for now), throw an error telling
        //the user so and the file size limit.
        if (totalFileSize >= 100 * 1024 * 1024) {
          throw new Error(messages.BIG_FILE);
        }

        zipContent.content = zip.files[name]._data.compressedContent;
        fileCount++;

        //Set limit on number of documents that a zip file can contain in order to avoid
        //sending tons of files at once. Currently set at 50.
        if (fileCount > 50) {
          throw new Error(messages.TOO_MANY_FILES);
        }

        //If a file is in a folder, the file name includes the folder's name
        //as well. This looks at the encountered folders so far and removes
        //the excess folder name out of the file name.
        folderNames.forEach(folderName => {
          if (zipContent.filename.indexOf(folderName) > -1) {
            zipContent.filename = name.substr(folderName.length, name.length);
          }
        });

        //Get the compression type of the individual file in the zip file
        zipContent.compressionType = findCompressionType(zipContent, zip.files[name]._data.uncompressedSize);

        //Push the file information into the array to be handled later
        addOrUpdate.push(zipContent);
      }
    });

    return addOrUpdate;
  });
};

//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url for files, or urls in general).
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If zip file sent, see handleZip for how it
//is dealt with. See convertToZip on how the supported tar files are handled.
const fetchFile = url => {
  const fetch = require('node-fetch');
  const contentDisposition = require('content-disposition');
  const mime = require('mime-types');

  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };


  return fetch(url)
    .then(response => {

      //If the url given is redirected to another place, doesn't match the given url, or contains link, the given file url
      //wasn't the url content was extracted from. So, throw the bad fetch error.
      if ((response.headers.get('link') || response.url != url || response.headers.get('www-authenticate'))) {
        throw new Error(messages.BAD_FETCH);
      }

      details.size = response.headers.get('content-length');
      details.contentType = '.' + mime.extension(response.headers.get('content-type'));
      const disposition = response.headers.get('content-disposition');

      //The file is too big (100 MB for now), throw an error telling
      //the user so and the file size limit.
      if (details.size >= 100 * 1024 * 1024) {
        throw new Error(messages.BIG_FILE);
      }

      //If disposition exists, makes getting this file info very easy/possible like this
      if (disposition) {
        details.filename = contentDisposition.parse(disposition).parameters.filename;
      }

      //If mime-type couldn't pick up an extension, try the filename for an extension
      if (details.contentType === '.false') {
        details.contentType = path.extname(details.filename);
      } 

      //Return the promise/buffer of the file
      return response.buffer();
    })
    .then(content => {
      details.content = content;

      // Using short names like 'c' and 'len' to improve readability in this case.
      const c = details.content;
      const len = c.length;
      const type = details.contentType;
      const name = details.filename;

      //Zip file, send to handleZip to get content. This helps to detect compression/file types based upon bytes in the data buffer for the
      //following conditional chain: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
      if ((c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05)) || type === '.zip') {
        
        return handleZip(details);

        //These are the bad tar types, throwing errors could break the app if the user doesn't realize the tar types they send are bad. So, instead of throwing an error,
        //do nothing, index the file with no extraction, and let the user look at their log in the platform to see why things aren't being extracted.
      } else if((c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00 && (name.indexOf('.txz') > 0 || type === '.tar')) || (c[0] === 0x1f && c[1] === 0x9d && (type === '.tar' || name.indexOf('.Z') > 0)) || (((name.indexOf('.lzma') > 0 && type === '.tar') || type === '.bin') || ((name.indexOf('.tlz') > 0 && type === '.tar') || type === '.bin'))){
        //This looks at bytes in the beginning of the buffers as well as if it is a tar file. Tar files using compression outside these will not be indexed.
        //This tests to see if tar file sent or any possible tar file compression type was sent. Compressions for tar that are supported include: gzip, bz2, and .tar.
      } else if (((c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) && (type === '.tar' || name.indexOf('.tgz') > 0)) || (c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68 && (name.indexOf('.tbz2') > 0 || name.indexOf('.tbz') > 0 || name.indexOf('.tb2') > 0 || type === '.tar')) || type === '.tar'){
        
        return convertToZip(details);

      }

      //If neither the zip or tar cases picked up anything, this is some single file
      //type, like pdf, or a file type that isn't supported (in which no valuable content will be extracted in the source)
      //and Coveo may or may not delete the submission.
      return details;
    });
};

//Get the size of a buffer if a size wasn't given in the file description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');

module.exports = {
  fetchFile,
  findCompressionType,
  handleError,
  getStringByteSize,
};
