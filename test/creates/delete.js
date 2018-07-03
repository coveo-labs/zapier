// require('should');

// const zapier = require('zapier-platform-core');

// const App = require('../../index');
// const appTester = zapier.createAppTester(App);

// describe('deletes', () => {
//   zapier.tools.env.inject();
//   describe('Delete content', () => {
//     it('should delete a doc', (done) => {
//       zapier.tools.env.inject();
//       const bundle = {
//         authData: {

// 	  access_token: process.env.ACCESS_TOKEN,
// 	  refresh_token: process.env.REFRESH_TOKEN,

//         },
	
//         inputData: {
//           docId: 'https://docs.google.com/presentation/d/163C2QNVAz29_ld51Rjt2x6d2VrFdIhXCvWgLyLXLGvE/preview?ouid=112521140643491791554',
//           sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
//           orgId: 'bryanarnoldzapier9xh3mbas',
//           platform: 'pushdev.cloud.coveo.com',
// 	  children: false,
//         },
//       };

//       appTester(App.creates.deletes.operation.perform, bundle)
//         .then((result) => {
//           console.log(result);
//           done();
//         })
//         .catch(done);
//     });
//   });
// });
