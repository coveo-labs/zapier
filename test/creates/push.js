require('should');

const orgId = 'testzaporg1g2oidag';
const sourceId = 'testzaporg1g2oidag-v5226ruqmtt32dgbfsi6nzcmcq';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', () => {

  it('Push Test', (done) => {
    //This must be included in any test file before bundle, as it extracts the
    //authentication data that was exported from the command line.
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this content to match your source and what you want to push when testing
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1sFsxnQLK27dO03pwT8o5wK3zfM1gArIu/preview?usp=drivesdk',
        title: 'No parent test',
        // content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtOwzAQRX-l8oIVbezYcZNIFUJCSIiXkNhXxp66SRzb9aOlIP6dpGLLrOZenZnF-UadjUlYCdtOoZZhUuOS0Wu068CorRUjoHYKBtA1knuQw3aAM2oJL6sLJ51NYNM2nf1MvkzYcBJBR9R-oxzM1O1T8rEtCuXkkuAlx8tpiyvtnDaQI4S_HyvpxhmKRQSZA0RZdEOEss89w8C1B9_49YehjRp2cHDBHosc3Ed_bDDVBy7oeExV6HXsvKgOqe9oLkhFS8oJx_MUhHLKWF1SVjV1g0lTr_k_ZbyPn_bt6bFcq1dM_em9dtXpkX7tnom-DQ_5Zr8hjHCy5mXDa15iyjhj1RVslDtZ44S60mqTQp7N7VwYRZpceJ8-p5y6ZGZdT8LqLDQs7uAIxvlx0rAQVi3eQe6tM06fV5eTn59feEmHyQ:1fhepO:bbbLvOOoolUjz5wDHbw_Q3Z98yc/',
        field1: 'thumbnail',
        data: '<html><p>Why no work</p></html>',
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
