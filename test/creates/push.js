const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

// Tests for pushing a document in a push source. Change the inputData to match the credentials
// of the source you're testing.

describe('pushes', function() {
  before(function() {
    // This must be included in any test file before bundle, as it extracts the
    // authentication data that was exported from the command line.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Push Test', function() {
    this.timeout(10000); // set timeout to 10 seconds
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      // Change this content to match your source and what you want to push when testing
      inputData: {
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1-jnhmXWsxgy0E1De0mJkBSriJYjeV4Dt/preview=usp=drivesdk',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kMtOwzAQRX8FedFV2_gVJ45UIaGCRBdsQLw2UWpPU-dhB9uhLRX_TorYMqu5Z65mcc7I2BArq6A0GhUcS5rlMpujnYFOl7bqARVT6ADNkdqDassWTqgggqaUs4k5G8HGMp6GS_NhqrWHytcBFWc0-m5i-xiHUCSJdmqB24XAi2kLy9q5uoMxgP_7sVSuv5RCEkCNHoJKTBuANmPDMYh6gEEO2bZjUrc7-HDefia6SU3aGuezptdbGQLTtdgaJYRvlNqNCUkZY4Ti30kIE4zznDKeylxiIvNM_AMXjd33ry_hWJ_wLVkD7jftzaM3m7cGnvk6Xu9XhBNBMkGlyAXFjAvO0xmstDvYzlV6VutV9OPF3M75voqTi-PXlKKJ3UXWnes0-Hv7boYnCPGKLqfz9_cPavB_Sw:1fldle:sD77bD-vkSkkhFO1BfKvWMp_HvY/',
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
