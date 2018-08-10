const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

//Tests for pushing a document in a push source. Change the inputData to match the credentials
//of the source you're testing.

describe('pushes', function() {
  before(function() {
    //This must be included in any test file before bundle, as it extracts the
    //authentication data that was exported from the command line.
    //Put test ACCESS_TOKEN in a .env file as well as the org/source information.
    //The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Push Test', function() {
    this.timeout(10000); //Set timeout to 10 seconds
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      //Change this content for your testing
      inputData: {
        documentId: 'https://drive.google.com/a/uconn.edu/file/d/1Y-ozUehmYIkwPUJ8Y-6JyZS51cZ4aljr/preview?usp=drivesdk',
        title: 'Push Test',
        content: ['https://zapier.com/engine/hydrate/1625243/.eJx1kD1rwzAYhP9K0RBaSGJ9WbYMoZQWOjTNVEg248ivP2JZci0pIYT899qla2-6Ox5uuBtqjfOFUZC3Jco44ZhizJaoakGXuSl6QNkUNKAlUg2oLu_gijIiaEz5xClrPBif--swk7sJ6y7FWDuU3VAY9dQ13g8ui6LSqhVOVwKvJufWtbW1huBg_NtYK9vPkIscqDCCU1HbOaCncOIYRD3AIIfkqJksuwq-7WjOUaNaLTvpxxNVIXR1kp4TL4_EiCrx1iURiRmTlONfRYQJxnlKGY9lKjGRaSL-Ka2vv7b5frv7SNnrYb_bv8Vi-6X1-6GuXppP8dxsCCeCJIJKkQqKGRecxwvYlPZitC3KRV1u_Bjm5yo79oVHmQlaL5FvvZ7P6oOeLDhPHh7JE7rffwCdVHvN:1foDL5:L98n4pBwt7nEyz0hOrYHB1XcvMo/',
        'https://doc-0o-60-docs.googleusercontent.com/docs/securesc/ikse2juj40e6gpep9p7bl39dkfeqornv/m82j2d6luh330v17rve0fh7j3q213m7e/1533916800000/13634482345989019876/13634482345989019876/15JipdK-CBF0gpWVW61Vr6uB6p_voVTuI?h=14161762968620346445&e=download&gd=true',
        'https://drive.google.com/a/uconn.edu/file/d/1Y-ozUehmYIkwPUJ8Y-6JyZS51cZ4aljr/preview?usp=drivesdk',
        'https://www.example.com/'],
        fields: {author: 'Bryan Arnold', site: 'https://coveo.com/'},
        data: 'testing',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
