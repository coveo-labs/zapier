require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', () => {

  it('Push Test', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this content to match your source and what you want to push when testing
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1ADr6MijRQXau5knmlfEAIEz6nz_BsUP5/preview?usp=drivesdk',
        title: '100MB',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtqwzAQRf9Fi6yaWLJk-QGhJDSLLlLaQqE740hjW7YsOZLckIT-e-3SbWc193CYgXtHyvhQGQGlkqhgmGQ4ZvQB1Qq0LE01ACrmoAE9INGC6MserqggPE5-PWFNABPKcB0X82XW-kvlGo-KO5qcnlkbwuiLKJJWrDFbc7yeN79prG00TB7c342NsMMi-ciDmBx4EaneQ9xNHcPAmxHGfExPmuayr-FsnfmKEhmGKYWudd1JM5oPaZC2HalqCZ3qs4hIQmNMMcPLRIRyylgWU5bkWY5JnqX8H7h7cvyouve3z2pKejPo-rB7Pty4uZV7__GaPLZbwggnKY9znvH5CeOMJSvYSnsx2lZy1chtcNPSXG3dUIW5i5sa5xhU0EtbBOPjfrOw7-8fBKN6fw:1fgFuK:IIRCUHDlfuxXK6Rd2aYC4rip8w4/',
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
