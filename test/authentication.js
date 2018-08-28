const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

// Tests for making sure the authentication process is working. Tests getting
// an access_token, using it, and get a refresh token.

describe('basic authentication', () => {
  before(function() {
    // Put test ACCESS_TOKEN in a .env file.
    // The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();

    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN');
  });

  it('Testing refresh token', function(done) {
    const bundle = {
      authData: {
        access_token: 'bad-token',
      },
    };

    appTester(App.authentication.test, bundle).catch(err => {
      should.equal(err.name, 'RefreshAuthError', 'Should get a "RefreshAuthError" error.');
      done();
    });
  });

  it('Testing access token', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
    };

    return appTester(App.authentication.test, bundle);
  });
});
