require('should');
const base64 = require('base-64');
const pako = require('pako');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  describe('Push content', () => {
    it('should push some text', (done) => {
    zapier.tools.env.inject();
      const bundle = {
	authData: {

	  access_token: process.env.ACCESS_TOKEN,
	  refresh_token: process.env.REFRESH_TOKEN,

	},
	
        inputData: {
          docId: 'https://docs.google.com/presentation/d/163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE/preview?ouid=112521140643491791554',
          title: 'Language Development and Technology',
          sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
          orgId: 'bryanarnoldzapier9xh3mbas',
          platform: 'pushdev.cloud.coveo.com',
	  data: 'Old presentation I did for LING 3610W.',
	  thumbnail: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation',
	  download: 'https://docs.google.com/feeds/download/presentations/Export?id=163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE&exportFormat=pdf',
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
});
