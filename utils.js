'use strict';

const messages = require('./messages');
const path = require('path');

//Simple function to handle an error occuring in a function that I didn't catch.
//For instance, an error in grabbing the index of an array out of bounds would be caught by this.
const handleError = error => {
  if (typeof error === 'string') {
    throw new Error('Error occured during processing: ' + error);
  }

  throw error;
};

//This function is to allow for a few more types of archive files to be
//used instead of just a zip file. Includes tar and the tar extensions .tar.gz or .tar.bz2 (and their short hands).
//This function takes the contents and transforms them into a zip file buffer, then
//sends off to the zip file handler to process. It'd be a waste to completely erase the
//zipHandler method, since it uses JSZip which is very fast and useful for specific content extraction. This can be expanded upon in the future, but encompassing all archive
//file types would be very labor intensive.
const convertToZip = details => {
  let archiveFile = details;

  //This is all for decompressing the contents of the files
  //See: https://www.npmjs.com/package/decompress
  //Will work for any tar archive file type with any compression type applied
  //This can be expanded upon in the future, but having all tar and zip files
  //available for all the content to be uploaded is a good start
  const decompress = require('decompress');
  const zip = require('node-native-zip'); //Consider swapping to this in the future: https://github.com/archiverjs/node-archiver

  //Create new zip archive, and decompress the contents. The plugins are
  //checkers that alter the function depending on the archive file type.
  let newArchive = new zip();
  const toConvert = decompress(archiveFile.content, {
    inputFile: archiveFile.content,
  });

  return toConvert.then(files => {
    let fileCount = 0;

    //Loop through the file contents and add them to the new zip archive
    //with the file names and buffers associated with them.
    files.forEach(file => {
      //Ignore folders in the total file count, as we
      //do not care about indexing folders.
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

const findCompressionType = (zipContent, uncompressedSize) => {
  // If the data is in a zip but not compressed, give it the uncompressed data compression,
  // otherwise it is deflate for zip. Check the first few bits to see if other algorithms used
  // before defaulting to deflate.
  // Used this as a reference: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
  // This may not be necessary, will have to do some testing to confirm. May be needed, as files can be compressed differently within the same zip, depending on
  // how the archive file was made. So, if anything, this is a backup case for the files inside.  DEFLATE last as it is the last possible valid compression type Coveo allows wihtin a zip file, throw an error otherwise.

  let compressionType = 'DEFLATE';

  if (zipContent.content[0] === 0x1f && zipContent.content[1] === 0x8b && zipContent.content[2] === 0x08) {
    compressionType = 'GZIP';
  } else if ((zipContent.content[0] * 256 + zipContent.content[1]) % 31 === 0) {
    compressionType = 'ZLIB';
  } else if (zipContent.contentType === '.lzma') {
    compressionType = 'LZMA';
  } else if (zipContent.size === uncompressedSize) {
    compressionType = 'UNCOMPRESSED';
  }

  return compressionType;
};

//This is the handler for extracting all the files within a zip file. Extracts the files important features
// for pushing to Coveo (sizes, content of files, file types, file names).
const handleZip = details => {
  const addOrUpdate = [];

  const JSZIP = require('jszip');
  const zip = new JSZIP();

  const zipFile = zip.loadAsync(details.content);

  return zipFile.then(zip => {
    //Filter out hidden files. Coveo can't really extract anything from these and some users
    //may prefer not to have their hidden files pushed into an index.
    let names = Object.keys(zip.files).filter(file => !/(^|\/)\.[^/.]/g.test(file));

    //Track folder names and number of files currently prepped for upload. Also
    //track total file size so the user doesn't send files that are too big.
    let folderNames = [];
    let fileCount = 0;
    let totalFileSize = 0;

    names.forEach(name => {
      let zipContent = {};

      if (name.indexOf('__MACOSX/') > -1) {
        // These files are macOS dependent and don't have any valuable content for Coveo to extract, so ignore them.
      } else if (zip.files[name].dir) {
        // Also ignore folders within the zip file, just want their contents not the folders themselves, but keep folder names
        // to help alter the file names within it.
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
        //customers sending hundreds of files at once and crashing services. Currently set at 50.
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

        //Sometimes extensions for files can be screwed up by how Zapier handles zip files. Not sure if
        //null is possible, so I put it in just to be safe.
        if (zipContent.contentType === 'undefined' || zipContent.contentType === 'null' || zipContent.contentType === '') {
          zipContent.contentType = '.' + name.split('/')[1].split(';')[0];
        }

        zipContent.compressionType = findCompressionType(zipContent, zip.files[name]._data.uncompressedSize);

        addOrUpdate.push(zipContent);
      }
    });

    return addOrUpdate;
  });
};

//Default method to extract content sent from Zapier. Will extract the file content using fetch (since everything
//Zapier sends is in the form of a url). If a bad fetch occurs, fails or incorrect url, a flag will indicate for later functions to handle.
//Returns the file content as a buffer, file name, file type, and file size if all goes well. If zip file sent, see handleZip for how it
//is dealt with.
const fetchFile = url => {
  const fetch = require('node-fetch');
  const contentDisposition = require('content-disposition');

  const details = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };

  return fetch(url)
    .then(response => {
      //If the url given is redirected to another place, doesn;t match the given url, or contains link, the given file url
      //wasn't the url content was extracted from. So, throw the bad fetch error.
      if (response.headers.get('link') || response.url !== url || response.headers.get('www-authenticate')) {
        throw new Error(messages.BAD_FETCH);
      }

      details.size = response.headers.get('content-length');
      const disposition = response.headers.get('content-disposition');

      //The file is too big (100 MB for now), throw an error telling
      //the user so and the file size limit.
      if (details.size >= 100 * 1024 * 1024) {
        throw new Error(messages.BIG_FILE);
      }

      if (disposition) {
        details.filename = contentDisposition.parse(disposition).parameters.filename;
        details.contentType = path.extname(details.filename);
      }

      //The url Zapier supplies for files sometimes leaves the contentType blank or undefined. Not sure if
      //null is possible, so I put it in just to be safe.
      if (details.contentType === 'undefined' || details.contentType === 'null' || details.contentType === '') {
        details.contentType =
          '.' +
          response.headers
            .get('content-type')
            .split('/')[1]
            .split(';')[0];
      }
      //This is returning a promise, so the promise must be executed before filling
      //the content of the file details with the file buffer.
      return response.buffer();
    })
    .then(content => {
      details.content = content;

      // Using short names like 'c' and 'len' to improve readability in this case.
      const c = details.content;
      const len = c.length;

      //Zip file, send to handleZip to get content. The content type being zip or the bytes at the beginning being that of a zip will make sure a zip file is currently being processed.
      //This helps me detect compression/file types based upon bytes in the data buffer: https://stackoverflow.com/questions/19120676/how-to-detect-type-of-compression-used-on-the-file-if-no-file-extension-is-spe
      if (details.contentType === '.zip' || (c[0] === 0x50 && c[1] === 0x4b && c[2] === 0x03 && c[3] === 0x04 && c[len - 1] === 0x06 && (c[len - 2] === 0x06 || c[len - 2] === 0x05))) {
        return handleZip(details);

        //These aren't supported tar compression types in the implementation, so just return what file details were grabbed and
        //push into the source. Throw an error telling them these aren't supported, might change this later to just index with no content.
      } else if ((c[0] === 0x1f && c[1] === 0x9d) || details.contentType === '.tlz' || (c[0] === 0xfd && c[1] === 0x37 && c[2] === 0x7a && c[3] === 0x58 && c[4] === 0x5a && c[5] === 0x00)) {
        throw new Error(messages.UNSUPPORTED);

        //This looks at bytes in the beginning of the buffers as well as the content type of the other supported archive files.
        //This tests to see if tar file sent or any possible tar file compression type was sent. Compressions for tar that are supported include: gzip, bz2, and no compression.
        //As far as I can tell, there's no good way of detecting tar compression types other than this, since sometimes the content type provided from the fetch will be an octet stream or object (which aren't helpful)
      } else if ((c[0] === 0x1f && c[1] === 0x8b && c[2] === 0x08) || (c[0] === 0x42 && c[1] === 0x5a && c[2] === 0x68) || details.contentType === '.tar') {
        return convertToZip(details);
      }

      //If nither the zip or tar cases picked up anything, this is some single file
      //type, like pdf, or a archive file type that isn't supported (in which no valuable content will be extracted in the source).
      return details;
    });
};

//Get the size of a buffer if a size wasn't given in the fiel description
const getStringByteSize = string => Buffer.byteLength(string, 'utf8');

module.exports = {
  fetchFile,
  handleError,
  getStringByteSize,
};
