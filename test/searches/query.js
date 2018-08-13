/* globals describe it */
const should = require('should');

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('My App', () => {
  it('should run searchs.query', done => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      }, 
      inputData: {
        lq: 'What is Coveo for Sitecore?',
        sortCriteria: 'Relevancy',
        organizationId: 'coveosearch',
        numberOfResults: '6',
      }, 
    };

    appTester(App.searches.query.operation.perform, bundle)
      .then(results => {
        should.exist(results);
        console.log(results);
        done();
      })
      .catch(done);
  });
});
