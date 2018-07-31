const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('GET organizations', () => {
  before(function() {
    // Put your test ACCESS_TOKEN in a .env file.
    // The inject method will load them and make them available to use in your tests.
    zapier.tools.env.inject();

    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN');
  });

  it('Testing GET /organizations', function(done) {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
    };

    appTester(App.triggers.orgChoices.operation.perform, bundle).then(response => {
      should.ok(response);
      should.ok(response.length > 0);

      // first object
      let first = response[0];
      should.equal(Object.keys(first).length, 2);
      should.ok(first.id);
      should.ok(first.displayName);

      done();
    });
  });

  it('Testing GET /organizations/[org]/sources', function(done) {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        orgId: process.env.TEST_ORG_ID,
      },
    };

    appTester(App.triggers.orgSources.operation.perform, bundle).then(response => {
      should.ok(response);
      should.ok(response.length > 0);

      // first object
      let first = response[0];
      should.equal(Object.keys(first).length, 2);
      should.ok(first.id);
      should.ok(first.name);

      done();
    });
  });


  it('Testing GET /organizations/[org]/indexes/page/fields', function(done) {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        orgId: process.env.TEST_ORG_ID,
      },
    };

    appTester(App.triggers.sourceFields.operation.perform, bundle).then(response => {
      should.ok(response);
      should.ok(response.length > 0);

      // first object
      let first = response[0];
      should.equal(Object.keys(first).length, 2);
      should.ok(first.id);
      should.ok(first.name);

      done();
    });
  });
});
