require('should');
const base64 = require('base-64');
const pako = require('pako');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  describe('push content', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          docId: 'https://docs.google.com/presentation/d/163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE/preview?ouid=112521140643491791554',
          title: 'Language Development and Technology',
          sourceId: 'wbacha42szsafnirfla6zycawy-bryanarnoldlw2s8vft',
          orgId: 'bryanarnoldlw2s8vft',
          platform: 'push.cloud.coveo.com',
	  content: 'https://docs.google.com/feeds/download/presentations/Export?id=163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE&exportFormat=pdf',
	  data: 'Added old presentation I did for LING3610W.'
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
