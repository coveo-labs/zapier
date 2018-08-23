'use strict';

const should = require('should');
const zapier = require('zapier-platform-core');

//No reason to test handleError, it's a backup error handler that'll most likely never happen.
//Most of the file related utils functions left out of this, since they're very reliant on actually reading files. Can be put here later to 
//individually test them if so desired. These tests are easy/aren't too dependent on reading actual files.
const { getStringByteSize, coveoErrorHandler, validateFetch, validateFileCount, validateFileSize, archiveFileNameFilter } = require('../utils');

describe('utils', () => {
  //This must be included in any test file before bundle, as it extracts the
  //authentication data that was exported from the command line.
  //Put test ACCESS_TOKEN in a .env file as well as the org/source information.
  //inject() will load them and make them available to use in tests.
  zapier.tools.env.inject();

  should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
  should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
  should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  it('Testing getStringByteSize', () => {

    const getStringByteSizeTests = [
      {
        string: 'asdfjkl;',
        expected: 8,
      },
      {
        string: '',
        expected: 0,
      },
      {
        string: new Buffer.from('This is a test with a buffer'),
        expected: 28,
      },
      {
        string: new Buffer.from(''),
        expected: 0,
      },
    ];

    getStringByteSizeTests.forEach((test) => getStringByteSize(test.string).should.equal(test.expected));
  });


  it('Testing coveoErrorHandler', () => {

    const coveoErrorHandlerTests = [400, 401, 403, 412, 413, 429, 500, 415, 404, 514, 60000, -3];

    coveoErrorHandlerTests.forEach((error) => (function(){ coveoErrorHandler(error); }).should.throw()); 

  });

  it('Testing validateFetch', () => {

    const validateFetchTests = [
      {
        url: 'www.notabsolute.com/',
        expected: false,
      },
      {
        url: 'http://isabsolute.com/',
        expected: true,
      },
      {
        url: 'notabsolute://12356',
        expected: false,
      },
      {
        url: 'https://github.com/',
        expected: true,
      },
      {
        url: 'https://coveo.com/',
        fetchResponse: {
          url: 'https://coveo.com/',
          headers: {
            link: 'redirects to another place',
          },
        },
        expected: false,
      },
      {
        url: 'https://coveo.com/',
        fetchResponse: {
          url: 'https://coveo.com/',
          headers: {
            'www-authenticate': 'requires authorization',
          },
        },
        expected: false,
      },
      {
        url: 'https://coveo.com/',
        fetchResponse: {
          url: 'https://Coveo.com/',
          headers: {
            noBadHeaders: 'no bad headers here',
          },
        },
        expected: true,
      },
    ];

    validateFetchTests.forEach((fetch) => validateFetch(fetch.url, fetch.fetchResponse).should.equal(fetch.expected));
  });

  it('Testing validateFileCount', () => {

    const validateFileCountTests = [
      {
        fileCount: 50,
        expected: false,
      },
      {
        fileCount: 33,
        expected: false,
      },
      {
        fileCount: 0,
        expected: false,
      },
      {
        fileCount: -1,
        expected: false,
      },
    ];

    validateFileCountTests.forEach((test) => validateFileCount(test.fileCount).should.equal(test.expected));

    let badCount = 80;

    (function(){ validateFileCount(badCount); }).should.throw();

  });

  it('Testing validateFileSize', () => {

    const validateFileSizeTests = [
      {
        fileSize: 99 * 1024 * 1024,
        expected: 99 * 1024 * 1024,
      },
      {
        fileSize: 0,
        expected: 0,
      },
      {
        fileSize: -1,
        expected: -1,
      },
    ];

    validateFileSizeTests.forEach((test) => validateFileSize(test.fileSize).should.equal(test.expected));

    let badSize = 101 * 1024 * 1024;

    (function(){ validateFileSize(badSize); }).should.throw();

    let nullSize = 'null';
    let bufferOfNullSize = new Buffer.from('This is a test with a buffer');

    validateFileSize(nullSize, bufferOfNullSize).should.equal(28);

  });

  it('Testing archiveFileNameFilter', () => {
    let folderNames = [];

    const archiveFileNameFilterTests = [
      {
        path: 'test.txt',
        type: 'file',
        expected: false,
      },
      {
        path: 'folder/test.txt',
        type: 'directory',
        expected: true,
      },
      {
        path: '.DS_STORE',
        type: 'file',
        expected: true,
      },
      {
        path: '__MACOSX/test.txt',
        type:'file',
        expected: true,
      },
      {
        path: 'folder/with_bad_file/env.html',
        type: 'directory',
        expected: true,
      },
      {
        path: 'zapier.pdf',
        type: 'file',
        expected: false,
      },
      {
        path: 'long/folder/path/test/test.txt',
        type: 'directory',
        expected: true,
      },
      {
        path: '.hidden',
        type: 'file',
        expected: true,
      },
      {
        path: '__MACOSX/folder/should/not/be/put/into/list/of/folder/names/test.txt',
        type: 'directory',
        expected: true,
      },
      {
        path: 'blahblahblah',
        type: 'file',
        expected: false,
      },
    ];

    archiveFileNameFilterTests.forEach((file) => archiveFileNameFilter(file, folderNames).should.equal(file.expected));
    folderNames.length.should.equal(3);

  });

  it('Testing setSourceStatus INCREMENTAL', () => {

    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return setSourceStatus(bundle, 'INCREMENTAL');
  });

  it('Testing setSourceStatus IDLE', () => {

    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return setSourceStatus(bundle, 'IDLE');
  });

  //Can't test this function from utils.js, since the 
  //'z' component of 'z.request' isn't available for local testing.
  //Have to test is with a local version here. 
  const setSourceStatus = (bundle, status) => {
    const push = require('../config').PUSH;
    const http = require('http');

    //Send request to Coveo
    const statePromise = http.request({
      url: `https://${push}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/status`,
      method: 'POST',
      params: {
        statusType: status,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return statePromise;
  };
});