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
        documentId: 'https://mail.google.com/mail/u/0/#inbox/164dc93e35668805',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJxVklmTokgUhf-KwXNRwZJg6hugbJaCpaBlRweRBckmZLLKUlH_ve3uiZiZ13u_u8Q554vJSNshEuIgi5g14PgVxwnCCxNnuIgCgkrMrBnUdShMS0y6lnlhwhSH9-COJ2bNy4IkAPFZo6R7toNuqn4PHJ7YfUBN0jLrL6bEbYuSvxcYXgZRuBKxKMkyhJz0JP-7fv3ji_nDKQcjj2zIV8vcCFvXScp8_9jMOyOHg_VZLE8n3PWFJ8ln-snRqDiycbGvnTPrJhddPfXl9aOGjsqCdOvz4wdY3rQ7lcs7dvbB7b0ffXwA01WHHNBSX8eaptF3WqfHLackUY3Z5YZg0Bgt8Udw8BQqYxr0263OQj12bLPma9xvDP0tylihmXceGTbsUNp99jBnRx6IxF6H7noWjDoSe-TOnm-1yO481E-2vTR4BCrHSBvv-Y7Y7xVytmq5sPXU8u5jMeNUqu7cyj_EcOOIcq61421vjrAxSnP1IcIj2OtzbFf2JWS7hxL4JLA1PV3FXVEJO1XnnrL-Y55GH5gubqjKcLOwnjYlDeoySl4jGo6vycx8v_xf8ndNLR-cq0K9t8wyV5TQ6MYdio6xeiD1UnW7LZBv5TSONCCqdh-AryXW0LvwFLBl8hBb6-1I9_O15YFlFw8g-2RQAFIbkLa8f7U9CHsn5ld09IWyWR2L0ou5bX-wH0gdYtaLZsGIAlMaG9G_nmahSKHPH-zS0DZnId7PqWJmaaRdatyMpgNUOeN2n80KJS6bw_Q8FbHSTzv9IuVKlLim3Nj1VfyQLKRphnl3p_O0M-vTOyDUPIZqBQAK2ZnSSvGtHOb1lpXT8G1jZr67PO0LByascNtBcTBGQbQ8l5fi_nJTt91ylbHTtT8a0Rl2wfCv5G-IJP0z8YsNfuCCVr-jvUAkWpxxmBJa0GR6rapuZL5_fn__AgFtKqI:1fj5do:RoD8m6HNAxwxQEJIxDxVQUEQuYs/',
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
