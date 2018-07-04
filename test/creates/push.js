require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';
const platform = 'pushdev.cloud.coveo.com';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('DOCX', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://docs.google.com/document/d/1KhjjJfYbDNv7qr1Oif97s8NObyn4pzd1Lvc6YN6YPMg/preview?ouid=114222587917589844043',
        title: 'Coveo Zapier Integration',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJwtj81uwjAQhF8F-dATIgqQ0ERCPRQq9S_0Gi6RsTeJieNN7SWQIt69Du1p9c3OjmavTBlH3AgolGTpIomSMI6iKSsVaFkY3gJLPWhgUyZqEE3RwMDSMJ5H8-XCa2gIDBU0dKMz87bmzG3lWHplJ6u9VhN1Lg0CicLNKsRKw0xgG5QA0nn1bDRyOa5PrY9yAVw6tBRs7-NJyXX4Xh-Pb2V-2GT96tuGO1UmK_eY7Q6DWXY_MvzoRZxncf71WT38Xb-gbTmtfejFVyrv5Lv8MynSY91n7AEne94psJNX_0llOSk07Hb7BVuwYPg:1faoiN:VPOr9p9Gn7Fy2-8wAGM8mzFMedU/',
        sourceId,
        orgId,
        platform,
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
