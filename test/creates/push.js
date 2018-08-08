const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', function() {
  before(function() {
    //This must be included in any test file before bundle, as it extracts the
    //authentication data that was exported from the command line.
    //Put test ACCESS_TOKEN in a .env file as well as the org/source information.
    //The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Push Test', function() {
    this.timeout(10000); //Set timeout to 10 seconds
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this content for your testing
      inputData: {
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1j_X-vV_OpLlnjzxAKWQ5jwq36FEHGk-W/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kDtvgzAUhf-Lh0wh4AcGI0VVhz6kVq26NN0QwRcCNraDTdI0yn8vSF17p3M-Hd3hu6LO-FCZGspOooIlgmS5yNao6UDL0lQDoGIuGtAa1QeoVangggrMSUoYnZk1AUwow8Uty7d5ps7V2HpUXNE06pkdQnC-iGNp6yhhEU-iOflNa22rYfIw_v3Y1HZYRj72UE8j-DrulAfSTz1LgLcOnHDZXlMhVQNHO5pTPBxzwxsnvLBeOe68FFlLhaa0od2k8hinlGYpJslyMaacMpYTylKRiwSLPOP_wL78ik6f5bt71ab_-b5_2X2k_flI-ePD85OKdneHLWaY44wTwXNOEso4Y-kKttKejbaVXLVyG8ZpMdfYcajC7GJj9_3cQxf0omuY9BzBB3S7_QI55Xs_:1fnT6q:IPE7Suxg_sBUsWBiPJn3Qy1nIaE/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
