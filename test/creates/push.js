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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/18RCvXB3NC97q9sySdKfUyO1NZFTS__Ll/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kM1qwzAQhN9Fh5ySWLJk2TKEQgO9tKTQtFB6MYq1_olly7GkpE7Iu9cuvXZPO98OCzM3VHfWyS6HrFYoZYTiMCF8iYoatMo62QJKJ6EBLVFeQd5kDYwoJTyMQkYnZjoHncvc2M_O3WRrLnIoLUpvyA96YpVzvU2DQJl8hdmK49W02XVpTKnBWxj-fqxz084mG1jI_QA2D-rGQnj0R4aBlz30oo8PmgrVFHAyQ3cO2jOp9MGfTNu3MvKSNEpIegDi-yLurApIRGlCMcPzBIRyylgSUhaJRGAikpj_A5O37fnzke62Ij4JO-7Vc_ExvpLd19P7Pste9EO1IYxwEvNQ8ISHmDLOWLSAjTKXThupFqXauMHPzRVmaKWbupjifU_a1U7PdY3G67qBo7xe17-n-_0HDoB-pQ:1fnnYQ:KORO5chgeam8APN9Cx4lBOLdYLI/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
