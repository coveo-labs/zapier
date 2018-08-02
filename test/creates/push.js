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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1gPn6hl5z8EJRYK_McgxgrmiDxsO7IS3-/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kDtvgzAUhf-Lh0whgG2MjRR1aYe26kPt1AkRczEEYxPb5Kn894LUtXc659OnO5wb6owPlZFQdjUqaCJwzkW-Rk0Hui5NNQAq5qIBrZFsQfZlDxdUpAxnmJKZWRPAhDJcxsV8n7X-VDnlUXFDk9Mza0MYfRHHtZVRwiOWRHPyG2Wt0jB5cH8_NtIOi-RjD3Jy4GXc9R7wftrTBJgaYRRjvtNE1H0DB-vMMc6O3LjjYb_bVQltOe4n2ViRZVql2lJ7jNOMEEwwT5aLU8IIpRwTmgkuklTwnP0D1adhrc6u_Onl6-e1fJPqrNzQPZ79R_78TaKHdpvSlKU5w4JxhhNCGaXZCra1PRltq3ql6m1w07JcY91QhXmL83VuoQt6GWuYdOgaq2twAXzYhMptZuF-_wXa5oAj:1flI08:meFBUA_5jXRNk7yFQXojXEDayxI/',
        fields: {key: 'author', name: 'Bryan Arnold'},
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
