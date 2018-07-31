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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1aTn7XuK_t6UUcgwR3pN3Sh48w9rVRiRz/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtugzAQRf_Fi6waMLYxDynqB1TKIm2q7hC1B0MwmNgDURLl30vUbjure4-OZnHvpBsD1qOCqtOkFDTPOMvoC2k6sLoa6wFIuRYL5IWoFlRf9XAlZSJZygRfmRsRRqzwOj3N_ar1l9qbQMo7mb1dWYs4hTKOtVNbaraSbtcUIuOcsTAH8H8_IuWGpxTiAGr2EFTc9QHYaT4JCtJMMBVT9m15ofsGzs6PS-xzsWg1nFmuUc3N0i4J42ZS1C0Gi47FSco5lfT34oRLLkTOuEiLvKBJkWfyH1h_jNnX_FahPB6VuRz4tOfvrcgvhf88dIfba7tLRCKTTLJC5pJRLqQQ6QZ22l1G62q9MXqHfn4u1zg_1LhuYW5rww7tc6xhttg1zmrwCAEjrH20Co_HDymwgHA:1fkZa3:NqtTjsE8Z7mJy2c5QxcvsCZ9unY/',
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
