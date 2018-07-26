require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'slevs7b47ktbrkzfundtc22nvi-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for deleting a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('deletes', () => {
// This must be included in any test file before bundle, as it extracts the
// authentication data that was exported from the command line.
  zapier.tools.env.inject();
  describe('Delete Test', () => {

    it('Delete single document', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        authData: {
          
          access_token: process.env.ACCESS_TOKEN,
          refresh_token: process.env.REFRESH_TOKEN,

        },
  
        //Change these when you test
        inputData: {
          docId: 'https://drive.google.com/a/uconn.edu/file/d/1Cau7dNBMMF9ZjNwbsXkSt-m6a_3yTNse/preview=usp=drivesdk',
          title: 'Zapier Delete Test',
          sourceId,
          orgId,
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
