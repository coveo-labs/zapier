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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1eCzjVefCNxa7luy0fKT7pjGHyQm48lnA/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMFugzAQRP_Fh5ySYGxjMFJUVTm0UqVIlapeI4oXAhgb8LopifLvBanX7mnnzWgOcyeN9VjYEs6NJrmgiqWZSrekasDosy16IPkiDJAtKS9QducOZpLHkiVM8IU5i2DxjPOwJk9LrLsWU-1JfidhMgu7IA4-jyLtyh31O0l3y-f3tXO1geBh-uvYl65fQz7yUIYJfBk1nQfWhlZQkPUAgxrSL8OV7ioY3WS_o1FRjSPj0LpguFD1KGg7LKWF1wNiFsUJ55xJQdeLYi65EBnjIlGZorHKUvkPhOOt_YTqePopUhNmWr19pEP78jq_9yIz9vnpcohFLONUMiUzySgXUohkAwftrta4Qm9qfcAprMtVbuoLXLZAc1skNmjWtfpgsKmc0TAheNyv7uPxC3hvgFs:1flh8G:GV8kObwrcKM99r8nE0g0T1EHQVs/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
