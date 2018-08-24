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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1Y-ozUehmYIkwPUJ8Y-6JyZS51cZ4aljr/preview?usp=drivesdk',
        title: 'Push Test',
        content: ['https://zapier.com/engine/hydrate/1625243/.eJx1kLFugzAQhl-l8pApCTaYwyBFlVqpSqOqU4cqCwL7AgTHJrZpmkZ594LUtTfd_92vG74b6YwPlZFYdooUnAkQeQpLcuhQq9JUJyTFFDSSJZEtyr7s8UoKBnEa82Ri1gQ0oQzXYW6-T7X-UrnGk-JGRqcn1oYw-CKKlJUrKlZAV9Pm1421jcbRo_v7sZb2NJd85FGODr2Mut5jfByPnCI0Aw75kNU6yVV_wLN15iuCOudtU0Hfjy5OvLc2a7s6tOEMphEsRCxNeCaooPNELIGEcxEnPM1FTlkuMvgH0lrv5JN6Fntvv98kAJwvPNt-bqudFVeePbYbxhmwDOIcBMQ04cB5usCNshejbaUWjdoEN87mDtadqjC5-OmGKYYu6NnWi9UK3avZd8MH-vAQr-f7_f4LvMx-5g:1frnpS:QqC6iJVx4UsXw1DMPZwcjENrQFM/',
          'https://onlinehelp.coveo.com/en/ces/6.5/User/Whats_New.htm',
          'https://onlinehelp.coveo.com/en/ces/7.0/Administrator/Whats_New_-_For_Coveo_Platform_Administrators.htm',
          'https://onlinehelp.coveo.com/en/ces/7.0/Administrator/Whats_New_-_Coveo_Platform_7_Introduction.htm'],
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
