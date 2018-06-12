require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  describe('push content', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          docId: 'https://docs.coveo.com/en/12/cloud-v2-api-reference/push-api#tag/File-Container%2Fpaths%2F~1organizations~1%7BorganizationId%7D~1files%2Fpost',
          text: 'some text',
          sourceId: 'wbacha42szsafnirfla6zycawy-bryanarnoldlw2s8vft',
          orgId: 'bryanarnoldlw2s8vft',
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
