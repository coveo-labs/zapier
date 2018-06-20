const handleError = (error) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;
};

const getStringByteSize = (string) => Buffer.byteLength(string, 'utf8');

module.exports = {
  handleError,
  getStringByteSize,
};
