const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

// Tests for making sure the authentication process is working.
// Tests getting an access_token, using it, and get a refresh token.

describe('basic authentication', () => {
  before(function() {
    // Put test ACCESS_TOKEN in a .env file.
    // The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();

    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN');
  });

  it('Test a bad token, should catch error', function(done) {
    const bundle = {
      authData: {
        access_token: 'bad-token',
      },
    };

    appTester(App.authentication.test, bundle).catch(err => {
      should.equal(err.name, 'ResponseError', 'Should get a "RefreshAuthError" error.');
      done();
    });
  });

  it('Testing access token', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
    };

    return appTester(App.authentication.test, bundle)
      .then(content => {
        should.ok(content.username);
        should.ok(content.email);
      })
      .catch(err => {
        console.error(err);
        console.log(`\n\n INVALID ACCESS TOKEN - STOPPING TESTS HERE. \n\n`);
        // Invalid token - stop tests here.
        process.exit();
      });
  });
});
