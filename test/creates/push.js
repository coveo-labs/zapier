require('should');

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
          docId: 'https://docs.google.com/document/d/1KhjjJfYbDNv7qr1Oif97s8NObyn4pzd1Lvc6YN6YPMg/preview?ouid=114222587917589844043',
          title: 'Coveo Zapier Integration',
          sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
          orgId: 'bryanarnoldzapier9xh3mbas',
          platform: 'pushdev.cloud.coveo.com',
          content: 'https://www.coveo.com/-/media/Files/CaseStudies/BRP-Customer-Story.ashx',
          // thumbnail: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation',
          // download: 'https://docs.google.com/feeds/download/presentations/Export?id=163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE&exportFormat=pdf',
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
