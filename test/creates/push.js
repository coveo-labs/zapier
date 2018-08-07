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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1ufXmm3Sq5H90EcP7L8GmSSTueqqTc-xL/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kLFugzAQht_FQ6YQbGwMRoo6Ve0QVZWSoRsi9kEINgbbJE2jvHuh7dqb7vvv0w3_HbW9D1UvoWwVKhgWSZaLbI3qFrQq-8oAKmbQgNZInkB2ZQc3VBCepAmjc2b7AH0ow21YzLdZ666Vazwq7mhyes5OIQy-iGNlZYR9xHE0b37TWNtomDy4vx8bac0i-diDnBx4Gbedh-Q8nRkG3gwwiCE7aipUV8NoXX-J3Tg2ujbZ8aIafNHBEH3mI0-9ISoVCsckpZRnCf6ZmFBOGcsTylKRC0xEnvF_wqn-MIbux_RV4Gf5nu3yF7PfHyYYx4OMPndPpy1hhJOMJ4LnPMGUccbSFWyVvfbaVmrVqG1w09JcbZ2pwtzFVzvMGNqg4ZcC-ACObJbD4_ENuqh9Wg:1fn8oS:Sz6rNOvaYxejWuQm_VxpmJcE_As/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
