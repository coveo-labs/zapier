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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1L8_ywORdAWqBJpyfXPxHCbmnu4OcG8qe/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kE1LxDAQhv-K5LAo7PYjTdOmsIh6UERc8aK30ibTj22atEnqWhf_u614dWBg3peHOTxn1CrrCsUhbwXKSMBwkrJki6oWpMhV0QPKliABbRFvgHd5BzPKQopjTKKl08qBcrmbh5V8XrDuVJjaouyMJiOXrnFusJnvC813AdnRYLdc1qu1riVMFszfD4_rfoWsb4FPBiz3284CPk5HEgCtBxjYkJQyYqKrYNRGffhjM5al7riSCTYjpE0v2poBP464LjnDfhhH0bI0WMcPIxoRkuKIxCxlQcjShP5TPqX5fDq8ipu38fZxmKv3l8-Hu7JXEznw-3SE62YfkpCGCcWMphQHEaGExBvYC31SUhdiU4u9M9NqrtKmL9ziQn71xZJd6-Sqq5-kaystBRgH1nmuMBeX4ZX3i31__wCNrYNK:1fkyP7:TOyXTyPGtYuNqCn5OJW9Osv9RN8/',
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
