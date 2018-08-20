'use strict';

const should = require('should');
const zapier = require('zapier-platform-core');
const { getStringByteSize, findCompressionType, fetchChecker, fileCountChecker, fileSizeChecker, 
  archiveTypeChecker, archiveFileFilter, findExtension, findFilename, setSourceStatus } = require('../utils');

describe('Utils', () => {
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

  it('Testing fileCountChecker', () => {

    const fileCountCheckerTests = [
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

    fileCountCheckerTests.forEach((test) => fileCountChecker(test.fileCount).should.equal(test.expected));

    let badCount = 80;

    (function(){ fileCountChecker(badCount); }).should.throw();

  });

  it('Testing fileSizeChecker', () => {

    const fileSizeCheckerTests = [
        {
            fileSize: 99 * 1024 * 1024,
            expected: 99 * 1024 * 1024
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

    fileSizeCheckerTests.forEach((test) => fileSizeChecker(test.fileSize).should.equal(test.expected));

    let badSize = 101 * 1024 * 1024;

    (function(){ fileSizeChecker(badSize); }).should.throw();

    let nullSize = 'null';
    let bufferOfNullSize = new Buffer.from('This is a test with a buffer');

    fileSizeChecker(nullSize, bufferOfNullSize).should.equal(28);

  });
});