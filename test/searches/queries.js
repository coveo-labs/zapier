/* globals describe it */
const should = require('should');

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('searches', function() {
  before(function() {

    //This must be included in any test file before bundle, as it extracts the
    //authentication data that was exported from the command line.
    //Put test ACCESS_TOKEN in a .env file.
    //The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();
    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });


  it('Search a Specified Org Test', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      }, 
      inputData: {
        lq: 'Use Push API',
        organizationId: process.env.TEST_ORG_ID,
        sortCriteria: 'DateDescending',
        numberOfResults: '6',
      }, 
    };

    return appTester(App.searches.orgQuery.operation.perform, bundle);
  });

  it('Search Coveo Public Docs Test', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      }, 
      inputData: {
        lq: 'What is Coveo for Sitecore?',
      }, 
    };

    return appTester(App.searches.publicQuery.operation.perform, bundle);
  });
});
