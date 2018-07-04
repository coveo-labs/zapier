require('should');

const orgId = 'YOUR-ORG';
const sourceId = 'YOUR-SOURCE';
const platform = 'pushdev.cloud.coveo.com';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('PNG', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://106c4.wpc.azureedge.net/80106C4/Gallery-Prod/cdn/2015-02-24/prod20161101-microsoft-windowsazure-gallery/coveo.8caa5c90-ecad-4553-9810-cbd544455ba5.1.0.15/Icon/large.png',
        title: 'Coveo PNG',
        fileExtension: '.png',
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

  it('PDF', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://s3.amazonaws.com/static.coveodemo.com/test/BRP Customer Story.pdf',
        title: 'BRP Customer Story.pdf',
        fileExtension: '.pdf',
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

  it('PPTX', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://s3.amazonaws.com/static.coveodemo.com/test/BriefHistoryofSpaceExploration.pptx',
        title: 'Brief History of Space Exploration.pptx',
        fileExtension: '.pptx',
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
