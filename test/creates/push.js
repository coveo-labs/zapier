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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1-HoDAhLZxHlWBNXQljnfZYF3lujJcHRC/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtugzAQRf_Fi6xCsLExGCmq-lAVVVWkdtM2G0Ts4WkwwSZpEuXfC1W3ndW9R0ezuFdUddZlnYS0UihhmMQ4YHSJ8gq0SrusBZRMRQNaIlmCbNIGzighPAh_PWk6B51L3bmfze2kNadsKCxKrmgc9MRK53qb-L4y0sOxx7E3JbsqjCk0jBaGvx8radpZsr4FOQ5gpV81FoJ6rBkGXvTQiz7aaypUk8PBDN3Rj_PsgCnJ9tq05ij6XEySwgVpSzg0JvdJSIOIMIbn8wnllLE4oCwUscBExBH_B3ob83Rfvu6-N_rjYfv5pusu3309Uz3WL3Lz_nhXrgkjnEQ8EDzmAaaMMxYuYK3MqdMmU4tCrd0wzsvlZmgzN23h9GWqrnJ6Xqu4VL0D61Yzvt1-AGEGfK0:1fj74b:uPJXG2kdrTiLp8L2Ndrz9PkIHYI/',
        field1: 'thumbnail',
        data: '<html><p>Why no work</p></html>',
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
