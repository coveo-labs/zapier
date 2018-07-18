require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for deleting a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('deletes', () => {
  zapier.tools.env.inject();
  describe('Delete content', () => {

    it('Delete single document', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        authData: {
          
          access_token: process.env.ACCESS_TOKEN,
          refresh_token: process.env.REFRESH_TOKEN,

        },
  
        //Change these when you test
        inputData: {
          docId: 'https://drive.google.com/a/uconn.edu/file/d/1qFsBAhOwYT2a8uhk9bIl1Z6cxUFdETzP/preview?usp=drivesdk',
          title: 'Zapier Delete Test',
          sourceId: 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas',
          orgId: 'bryanarnoldzapier9xh3mbas',
        },
      };
      appTester(App.creates.deletes.operation.perform, bundle)
        .then((result) => {
          console.log(result);
          done();
        })
        .catch(done);
    });
  });
});
