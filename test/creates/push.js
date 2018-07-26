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
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1gCo7WwsHuD5qQbmscWClbeaqydpGa3-v/preview?usp=drivesdk',
        title: 'No parent test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kD1vgzAQhv-Lh0wFbPwRQIo6pFI7VeqUERFzgIOxwTakSZT_Xqi69qZ733t0w_NAyvhQGQmlqlHBMMlwyugLahToujTVAKhYgwb0gmQHsi97uKGCiJT_ctKaACaU4TZu5OeK9dfKtR4VDzQ7vXZdCKMvkqS2MsIsEjhaNx-31rYaZg_u70cs7bBBPvEgZwdeJqr3kF7mC8Mg2hHGfNyfNc3rvoHJOrMkBpxivu_6cbrw3i-d50Zjq5ppUXlHmoRwmnKWZXibhFBBGctSynie5Zjk2V78U7ZHuz9d_cf8xqev8-Dl6ajPUE23enyvaLS8dgfCiCB7keYiEymmTDDGd3Co7dVoW9W7tj4EN2_mGuuGKqwuvu9rCiroTdYw66DauxoD-BCHysXr-fn8AeMOgSI:1fiRIj:yiiFnRaR_x9fgNpXoVji-A3G16E/',
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
