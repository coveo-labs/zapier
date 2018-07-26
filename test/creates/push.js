require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'slevs7b47ktbrkzfundtc22nvi-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', () => {

  it('Push Test', (done) => {
    //This must be included in any test file before bundle, as it extracts the
    //authentication data that was exported from the command line.
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this content to match your source and what you want to push when testing
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1gl_8J4YAOf9UFEu04D7utaFbkO9TnG-w/preview?usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kLFugzAQhl8l8pApBAPGYKSoqtqmaodmaYd2QcQ-DAFsapukUZR3r4m69qa7X5_udN8Ftcq6SnEoW4EKgqMcxyRZobqFXpSqGgAVfugBrRBvgHdlB2dURDRObxzXyoFypTuPM_nmse5UGWlRcUGT6X3WODfaIgyF5gHmAcWB7-xaai17mCyYvx1rrocZsqEFPhmwPGw7C_FhOhAMVI4wsjHb9wkTXQ3f2qhjSFJqZMPrKdVJmzrJhqwmgzAHHHPDlAijNIlpjHM8VxglNCEkjxOSspzhiOUZ_SeUfZm_ks_7Xc0-tk8TJo_Z5Krtvtuxd_UcnO6aTUQiGmU0ZjT3JxJCCUmXsBH6pHpdiaUUG2em2VytzVA578K_9-Nn17p-1vWgj6AXX9XYglm8eAvSVK7Van3jrtdfzMuB_A:1fiiob:vW2AXAJxLYCReZVnueE_V_Xzmms/',
        field1: 'thumbnail',
        data: '<html><p>Why no work</p></html>',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
        field3: 'downloadlink',
        field3Content: 'download link test',
        sourceId,
        orgId,
      },
    };

    appTester(App.creates.push.operation.perform, bundle)
      .then((result) => {
        console.log(result);
        done();
      })
      .catch(done);
  });

});
