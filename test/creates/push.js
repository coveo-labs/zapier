require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('Single Item Push', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'gmail://1648faae1b085447',
        title: 'Bad Fetch Test',
        content: 'https://mail.google.com/mail/u/0/#inbox/1648faae1b085447',
        field1: 'thumbnail',
        data: 'This should be in the content of the submission',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
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
