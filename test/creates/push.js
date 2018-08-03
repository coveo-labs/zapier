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
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/14Q_Ylp7ZnWX8ecObK6ipoDN0C2fDZLMM/preview?usp=drivesdk',
        title: 'Push Test',
        // content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kD1PwzAURf-Lh05tYseu8yFVDFRICFqEhAR0iVL7JXXi2sF2WkrV_04isfKme4-O3nCvSBkfKiOgVBIVDOdJmuXpHNUKtCxNdQRUjEUDmiNxANGVHVxQQXiyTBgdmTUBTCjDpZ_M7ah158o1HhVXNDg9skMIvS_iWFqxIHjB8WJMPmqsbTQMHtzfj0jY4yT52IMYHHgRq85D0g4tw8CbHvq8T_ea5rKr4cs6c4q5oC1rRN10qqND2wwVObFUMa91xxmRMVlSSjHL8HQxoZwyliWULfMsxyTPUv4PZK_lp-7TnXn_yEC87J-46u16i--Ter173mzuDivCCCcpT3Ke8QRTxhlbzmAl7dloW8lZI1fBDdNytXXHKoxbfP-MLaigp7EerJbgHs1O9W_gQxQqF43C7fYLbUB-5Q:1flajI:ly-JRl7aWD1Jjn9ArM7HgRBNHUQ/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
