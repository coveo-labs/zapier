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
          docId: 'https://docs.google.com/presentation/d/163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE/preview?ouid=112521140643491791554',
          title: 'Language Development and Technology',
          sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
          orgId: 'bryanarnoldzapier9xh3mbas',
          platform: 'pushdev.cloud.coveo.com',
          content: 'https://zapier.com/engine/hydrate/3406357/.eJxNkVuvmkAUhf-Kmac2OTTAcNM3AfV4Pyge1KYhwzBchBlARgWM_72ctg993t9aK_n2E6Ss5ohh4qchGMEh1A1J0d9AlJI89BmiBIwA4hzhhBLGa_AGcEJw5mek7XlF1KDa47hgvD_7vC2_Apseyx7oGtdg9ASU1DWK_y4ASVMULGoIqRKUDMXoyf_rRz-f4A833swu4cJoP_IAjk0zf8Dus7BEcrZcfyzcD9V0s2nEvKqXwsrg4900WgdzEjsn-zbMKUN3M9oGa4_Dx_tiEk_Ma3wvGsk7ytHBVBMiI8kxa5wheN3NjdP1gpPuFghGpp3t7VoN-MOn4nQ_nx4JSp06w6VLeWt3bFaYmTBeHBZp18n7I1Erv0AuGdZhw7VwLs-ZLsCkrARJV2-5p6S1A11KP1YetVb8SiV7uTcClq1jw7OmmRadZTGcwVidtBbSHftzTRM79s0kP4rb4aw5pEtXb9rNutDoQypEFDnd_iBbzU57x9qSK2daaZ42q-z9icALako9DS3ca_33vBVi8a3XP7DJneRF-eV5gFg4cAlOWJEXcTv4Jn3_UYYReP16vX4Dk8Cv5g:1fYuy8:l4kHZFIHrjl4bQNowHPrk85OCKw/',
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
