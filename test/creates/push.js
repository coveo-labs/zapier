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
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1z9QD6gE4Joy-cR8LnTokb0c6YbJzOw0R/preview?usp=drivesdk',
        title: 'No parent test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kM1qwzAQhN9Fh5ziWJJlxTaEXtpLKC0NvfRkZGn9E8uSY8lJk5B3r1x67cLCzuzHsswddcZ5YSSUnUIFwyTDlCVrVHegVWnEAKgIQgNaI9mC7MserqggnKa_nLTGg_Glv44L-Raw_iKmxqHijuZJB6_1fnRFHCsrI5xFHEdhcpvG2kbD7GD6u7GRdlggFzuQ8wROxl3vgB7nI8PAmxHGfNxWOslVX8PJTuYcC69hsImqqCLidOLglaC1aVteT1l6xjFJE8rSlOKlYpLwhLGMJizNsxyTPNvyf8xb_vHMmxe2t9dIHrJX82n7Ckv-Ve1v7xd8eGp3hBFOtpzmPOMUJ4wzlq5gp-zFaCvUqlE7P81LcrWdBuFDFs0tKN-Fr4NwYhg1RN-D3iwddo_HDypLfVU:1fi2L9:LMFyqWQ5XczkzG2FQcKPOHTwDa4/',
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
