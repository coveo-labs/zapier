require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  describe('push content', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          docId: 'https://www.google.com/',
          title: 'Google.com Test',
          sourceId: 'wbacha42szsafnirfla6zycawy-bryanarnoldlw2s8vft',
          orgId: 'bryanarnoldlw2s8vft',
          platform: 'push.cloud.coveo.com',
	  note: 'This is a test.'
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
