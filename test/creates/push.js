require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', () => {

  it('Zip Testing', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this contentto match your source and what you want to push when testing
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1qFsBAhOwYT2a8uhk9bIl1Z6cxUFdETzP/preview?usp=drivesdk',
        title: 'Folders in Zip Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kD1vwjAQhv-LB6ZCYscxdiRUtVWRurQd6NAuUWJfPoixg-1AAfHfmyDW3nTve49ueC6oNT4URkLeKpTRGPOY0OQBVS1olZtiBygbgwb0gGQDsss7OKEMM5LeOGlNABPycOon8n3EumPhao-yCxqcHrsmhN5nUaSsnGM6Z_F83PyitrbWMHhw9x8LaXcT5CMPcnDgZdR2Hsh22NIYWN1DL_plqROhugr21plD5FOdcl_1fG_KSpVLrCTZhrg9aO772oUIpwkWlMa3iXDCEko5SWgquIix4Ev2T7lf--en5uP4vSEFH5pOlG8a_zD5-7VWr5vz52OzwhQzvGREMM5InFBGaTqDlbJHo22hZrVaBTdM5irrdkUYXZzbfoyhDXqy5cA6BQ7Uy93AdL5e_wB8SX_0:1fftEz:pV5dcvok5C6hSHrK3pDArxKjTNQ/',
        field1: 'thumbnail',
        data: 'This should be in the content of the submission if no content',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
        field3: 'downloadlink',
        field3Content: 'download link test',
        sourceId,
        orgId,
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
