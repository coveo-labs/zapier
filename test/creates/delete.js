// require('should');

// const zapier = require('zapier-platform-core');

// const App = require('../../index');
// const appTester = zapier.createAppTester(App);

// describe('deletes', () => {
//   zapier.tools.env.inject();
//   describe('Delete content', () => {

//     it('Delete single document', (done) => {
//       zapier.tools.env.inject();
//       const bundle = {
//         authData: {

// 	  access_token: process.env.ACCESS_TOKEN,
// 	  refresh_token: process.env.REFRESH_TOKEN,

//         },
	
//         inputData: {
//           docId: 'https://drive.google.com/a/uconn.edu/file/d/1CVhqP7vOyW1rpqvbI2yEbzMVIwnp5M4-/preview?usp=drivesdk',
//           title: 'Zapier Single Item Test',
//           sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
//           orgId: 'bryanarnoldzapier9xh3mbas',
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
