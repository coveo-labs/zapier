const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;
};

const getFileDetailsFromRequest = (url) => new Promise((resolve, reject) => {
  const fileDetails = {
    filename: '',
    size: 0,
    content: '',
    contentType: '',
  };

  fetch(url)
    .then((response) => {
      fileDetails.size = response.headers.get('content-length');
      fileDetails.contentType = response.headers.get('content-type');
      const disposition = response.headers.get('content-disposition');

      if (disposition) {
        fileDetails.filename = contentDisposition.parse(disposition).parameters.filename;
      }

      return response.buffer();
    })
    .then((content) => {
      fileDetails.content = content;

      return resolve(fileDetails);
    })
    .catch(reject);
});

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');

module.exports = {
  handleError,
  getFileDetailsFromRequest,
  getStringByteSize,
};
