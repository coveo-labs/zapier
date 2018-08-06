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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1NBiGDbTcdfKlTyvjBS5VhnWR82WO8Ww_/view?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtqwzAQRX-laJFVEutl-QGhtLSFbkobSiHeGFsaP2JbciS5IQ3599rQbWc198xlFueKWu18oSXkrUIpxwmN4iRao6qFXuW6GAClc-gBrZFsQHZ5BxeUEkFDytnMjPagfe4v49J8m2vdubC1Q-kVTbafWeP96NIgUEZucLwReDNvblsbU_cwObB_P7bSDEvJBQ7kZMHJoO0c0ON05BhEPcKYjFHZs0R1FZyM1d_BcOrIpOJCehgoCwvJja26yRWlLp1ucEBCxsKIULxMQJhgnMeU8TCJE0ySOBL_wExent_VY-ahVaWwPq-m_cP-65DVH_JJnA_3zY5wIkgkaCJiQTHjgvNwBTtlzro3hVrVaufttJirjB0KP7v4acc5-tb3i60X0yuwrzprx09w_o5vl_vt9guN7YCB:1fmiyT:g-8V-hzO3_PpOHzH_dhVLkYZwWE/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
