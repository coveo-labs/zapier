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
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1lP7to4SR8xvw_mIhhpoFR2dvnobLrJfI/preview?usp=drivesdk',
        title: 'Byte Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kD1rwzAURf-Lhkx1LFmyYhlCh0LGUJpCoYtxpGf5U3IkOSEN-e-VoWvfdO_h8obzQJ3xoTYSqk6hkmFSMErJC2o6GFVl6glQGcsI6AXJFuRQDXBHJeFZnjEamTUBTKjCfV6XxzgbbrXTHpUPtLgxsjaE2ZdpqqxMsE84TmLyW22tHmHx4P5-bKWd1pFPPcjFgZdpN3jI-qVnGLieYRbz7jxSoYYGLtaZa-qyWgchNTd9Ls4N5aSda62IC4u9LPSakpxmBAuO10sJ5ZSxIqMsF4XARBQ7_g88JvJ06Gtmv738eu91xw964h_3Nw9BnD7Na7snjHCy45ngBc8wZZyxfAN7ZW9mtLXaaLUPblnNNdZNdYgufro51tCFcbVFD1Gs367w-fwFsXF7vA:1fgZs4:9qeSpn9DOocwVWDSMKrGZYL4ans/',
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
