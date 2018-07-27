const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for deleting a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('deletes', () => {
  before(function() {
    // This must be included in any test file before bundle, as it extracts the
    // authentication data that was exported from the command line.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  describe('Delete Test', function() {
    it('Delete single document', function() {
      zapier.tools.env.inject();
      const bundle = {
        authData: {
          access_token: process.env.ACCESS_TOKEN,
        },

        //Change these when you test
        inputData: {
          documentId: 'https://drive.google.com/a/uconn.edu/file/d/1Cau7dNBMMF9ZjNwbsXkSt-m6a_3yTNse/preview=usp=drivesdk',
          title: 'Zapier Delete Test',
          sourceId: process.env.TEST_SOURCE_ID,
          orgId: process.env.TEST_ORG_ID,
        },
      };

      return appTester(App.creates.deletes.operation.perform, bundle);
    });
  });
});
