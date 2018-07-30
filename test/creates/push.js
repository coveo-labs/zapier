const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

// Tests for pushing a document in a push source. Change the inputData to match the credentials
// of the source you're testing.

describe('pushes', function() {
  before(function() {
    // This must be included in any test file before bundle, as it extracts the
    // authentication data that was exported from the command line.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Push Test', function() {
    this.timeout(10000); // set timeout to 10 seconds
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      // Change this content to match your source and what you want to push when testing
      inputData: {
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1y5BeREuM-5DSFwXAIwstcgmAlmc5SsxA/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kDtPwzAUhf-Lh05N41ech1ShIqjEAANd2KLUvknT2HGI7YZS9b-TIFbudM7Rpzt8N9T2zle9hLJVqOCYZJhytkZ1C1qVfWUAFXPRgNZInkB2ZQdXVBBBk19O2t5D70t_HRbybca6qRobh4obCqOet5P3gyviWFkZER4JHM3JbRprGw3Bwfj3YyOtWSAXO5BhBCfjtnNAz-HMMYhmgCEf0qNmuepq-LRjf4k1mJrS4HAqLpSZhqQuaCbZUUl7McchJgmjecoEXi4mTDDOM8p4kmc5JnmWin_Ga_II78_hNUqeDvvpY_cyOS8bs9NGJgf3tXs4bQkngqSC5iITFDMuOE9WsFV26rWt1KpRWz-GxVxtR1P52cV3O8zVt14vtth-Fus2y3i__wAz7Xss:1fkDSo:Hu-TnKYiF_C5Jz61Wa3jJSav458/',
        field1: 'thumbnail',
        // data: '<html><p>Why no work</p></html>',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
        field3: 'downloadlink',
        field3Content: 'download link test',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
