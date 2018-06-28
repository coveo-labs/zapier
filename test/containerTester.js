'use strict';

require('should');

const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('Create container and upload to', () => {
  zapier.tools.env.inject();

  it('should create container and upload to it and return upload info', (done) => {

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
        content: 'https://zapier.com/engine/hydrate/3406357/.eJxNkduSmkAURX_F6uchJRcZ8Y0WInJ3IgZMpboaaK7SEK6i5b-HSfKQ17PXObtqnSfIaddjGhGUx2DHS9xGkoTNG0hycosRxRUBO4D7HkdZRWjfgTcQZSQqUUnmhRfWIr95X2Y17ZcY9XPzuWAvWDnhNu3A7gkq0nU4_dsAWFEQWImTwi3hxEiMF_L_87sfT_CHk-1DEevSVfvOW63mnuDHuoz3iFJtYnQUdgz0sy7SzKOSkrwWmxHa3sW9D54shzlV1YGniqmlVcrAIRyGtVod2Y-ptZmzHiSJm7nJN5ln_b3AChuFbYw7GzOXA7ZaOUOFNelG0P56NJXT3pEFfW3eGoK17Q6eR33sTqRtaH8uh1q5M3NwtlwV3i8HmgTq11HsQwoZW1f441X3VVawH5Mzrd91NCf7aqwepTnqurfVkUJj_wTlUTYt2zXF0rwIGSsUKMecEk_QKXyYyGvlanEzkzpbM7THqOBOfhM4hWIZDtQCxzmSxDMevpGJXpSrR7c5qDCqF63_nmdimg6L_pVCRnKrm0_PK0zj1ZlEGa1vdTp_aeIEvH6-Xr8BY5mujA:1fYB9e:jKHaQSd9jQ-jr38iC3kdOgjryJg/',
	
      },


    };

    appTester(App.authentication.oauth2Config.createContainerAndUpload, bundle)
		 .then((results) => {
			
        console.log(results);
        done();

		 })
		  .catch(done);

  });

});
