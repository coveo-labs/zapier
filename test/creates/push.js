require('should');

const orgId = 'testzaporg1g2oidag';
const sourceId = 'testzaporg1g2oidag-v5226ruqmtt32dgbfsi6nzcmcq';

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
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1pa3F3PzEjgkFqdvnlpbmN6CEezD6G4-r/preview?usp=drivesdk',
        title: 'Compression Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kL1uwyAUhd-FIVMdg8H4R4o6tEm3qG9gOXBjY2MggBMlUd69dtW1dzrn6NMdvidSJsTWCGiURDXDpMQZo2_orEDLxrQToHopGtAbEj2IsRnhjmrCs_yXE9ZEMLGJd7eSxwUbb63vAqqfaPZ62foYXajTVFqR4DLhOFlS2HbWdhrmAP7vx1bYaYVCGkDMHoJI1RggG-aBYeCdA1e54qRpJcczXKw317S_Tlpibzg2Q9_l2qooTHGifvK5dGpKSU4zmjOG10sJ5ZSxMqMsr8oKk6os-D-ja-mBfj_2QzceLvJqtDtNR_6xh8cn_2KJf-93hBFOCp5VvOQZpowzlm9gJ-3NaNvKTSd30c-rubP1UxsXFw_llhpV1KsteljEhu06vl4_4AZ77w:1fhc2m:db_50yWXVD3HAAak-RsN1BpeBhc/',
        field1: 'thumbnail',
        data: 'This should be in the content of the submission if no content',
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
