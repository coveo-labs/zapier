require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

`
 {key: 'url', required: true, type: 'string'},
      {key: 'sourceId', required: true, type: 'string'},
      {key: 'orgId', required: true, type: 'string'},
      {key: 'apiKey', required: true, type: 'string'},
      {key: 'platform', required: true, choices: {dev: 'pushdev.cloud.coveo.com', qa: 'pushqa.cloud.coveo.com', prod: 'push.cloud.coveo.com'}}
`

describe('pushes', () => {

  describe('push content', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          docId: 'https://www.youtube.com/watch?v=1rmo3fKeveo',
          text: 'some text',
          sourceId: 'wbacha42szsafnirfla6zycawy-bryanarnoldlw2s8vft',
          orgId: 'bryanarnoldlw2s8vft',
          apiKey: 'xxb8c53956-b063-4504-8a3b-805359fc1d0e',
          platform: 'push.cloud.coveo.com'
        }
      };

      appTester(App.creates.push.operation.perform, bundle)
        .then((result) => {
          console.log(result);
          done();
        })
        .catch(done);
    });
  });
});
