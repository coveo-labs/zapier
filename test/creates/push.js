require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', () => {

  it('Zip Testing', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this contentto match your source and what you want to push when testing
      inputData: {
        docId: 'gmail://164a9dc8b1abd5c1',
        title: '3 Zip Testing',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJxtk1ePo1gQRv8Lz82KHPyGsYk2GQdGo6tLzsFcGptW__fx7szDrrSvVeerkk6pvrCqnxHskwxUKbZjCFIkCIr6wPIqa1PQwy7DdhhECCZll_Voxj6wpMySBjTZC9uRHMVSDP2uDT16twF6jX8HrDfWrPBRzNjuC-uyeYbF7w0YyTFQTBMhJmGcsgn5Jv89fvfjC_uHkyy1Tg1R8u-ml85yZtGNCfqT-Qh08aK6A6O1SCniAd98kb4piTuzTAGVwbBGae_qp1fnh2lLmXOCb6NxRYs98c0x9nr9OjkCmKLFikMSqh3F6cMINP8WxqsGWgby6ZBeddsqBpqulOBU7xcSXnTTajk2WRqFv7NiNu6pT8dQijprZt7blIoimGxIV2Uxnatn2tmlXGWVVPVALKuG9etC0FIjXrvs_CxYgs7nU5iOvpoPnL1X1Q0P65kjm3Viw0Pt6Kz4wuU2STce6QVpUk4vvnSdWaJKQCXr3u4XcOSP8EB17mIj3rnghzHvm2DB0e1AO4b71vrneK9haasmq-G2_ZUOyRP7_viPYhxw8zji6-ToN__A2H4eblEeRYD3nvy-cw-Af7ZLKq1alXxyN2ODXE2wBDTlIAjPc9wKkXlyapBa3iSfKGOuSzS11XOKRb4rjau69-M9Y7j1rRxEN03op-kRcLSts_EQPfGyKslojuhqlpLp85_MkkQHSzpSYw-uFN5ndcgLwiYFaubcQ2JKlG4YSc8vdXwKCoHcR6ghFwGgMdFGUWkrTtXB-Qxr9PhUfal0w-IhB_dso-zYmjUbt8oCly7aWTB1kJpAmUfvJsZxMNnDHAiePEmyz-sHOs_F40wqZce0Fv0yTxEJdVfvI028eRa5lhKODsOjkD0woAfrObaI86Xx_97f75FXBfb98_v7F4X9JKQ:1ffWII:dg4P4ttnwu0Abz2iSZLf9sQ48kE/',
        field1: 'thumbnail',
        data: 'This should be in the content of the submission',
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
