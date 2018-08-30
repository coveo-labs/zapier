const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);
const triggerUtils = require('../../triggers/utils.js');

// Tests for the dynamic drop down lists on the app. As long as these get the info needed, they'll work on Zapier as well.

describe('get drop downs', () => {
  before(function() {
    // Put test ACCESS_TOKEN in a .env file as well as the org/source information.
    // The inject method will load them and make them available to use in tests.
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

      // First object
      let first = response[0];
      should.equal(Object.keys(first).length, 2);
      should.ok(first.id);
      should.ok(first.displayName);

      done();
    });
  });

  it('Test filter sources 1', function() {
    let sources = JSON.parse(
      `[{"sourceType":"PUSH","id":"zapierbetaOrg-source1","name":"user1zapier","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"fa149347e46847a5b7cffe915ec845f0","operationType":"INCREMENTAL_REFRESH","timestamp":1535137974295,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":30,"documentsTotalSize":4090772},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source1"},{"sourceType":"PUSH","id":"zapierbetaOrg-source2","name":"user2@gmail.com test source","owner":"user1@coveo.com-google","sourceVisibility":"SHARED","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"42cc8f929afc411e9e5b1315fe6427e0","operationType":"INCREMENTAL_REFRESH","timestamp":1535593974282,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":97448},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source2"},{"sourceType":"PUSH","id":"zapierbetaOrg-source3","name":"Zapier test","owner":"user3@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"2dc4189e3b514572b0c0f275bf1260df","operationType":"INCREMENTAL_REFRESH","timestamp":1533937104194,"result":"SUCCESS","initialBuild":true,"numberOfDocuments":0},"numberOfDocuments":1,"documentsTotalSize":17},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user3@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source3"},{"sourceType":"PUSH","id":"zapierbetaOrg-source4","name":"ZapierDemo","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"6caa701f623d41cd9ed9f82b49f532fe","operationType":"INCREMENTAL_REFRESH","timestamp":1535593464541,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":1410},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source4"}]`
    );
    let privileges = [
      { type: 'VIEW', targetDomain: 'CUSTOM_DIMENSIONS', targetId: '*', owner: 'USAGE_ANALYTICS' },
      { targetDomain: 'EXECUTE_QUERY', targetId: '*', owner: 'SEARCH_API' },
      { type: 'EDIT', targetDomain: 'SOURCE', targetId: 'zapierbetaOrg-source2', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SOURCE', targetId: '*', owner: 'PLATFORM' },
      { targetDomain: 'VIEW_ALL_CONTENT', targetId: '*', owner: 'SEARCH_API' },
      { type: 'VIEW', targetDomain: 'FIELD', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ORGANIZATION', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SECURITY_CACHE', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ANALYTICS_DATA', targetId: '*', owner: 'USAGE_ANALYTICS' },
    ];

    sources = triggerUtils.filterSourcesWithPrivileges(sources, privileges);

    should.equal(1, sources.length);
  });

  it('Test filter sources 2', function() {
    let sources = JSON.parse(
      `[{"sourceType":"PUSH","id":"zapierbetaOrg-source1","name":"user1zapier","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"fa149347e46847a5b7cffe915ec845f0","operationType":"INCREMENTAL_REFRESH","timestamp":1535137974295,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":30,"documentsTotalSize":4090772},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source1"},{"sourceType":"PUSH","id":"zapierbetaOrg-source2","name":"user2@gmail.com test source","owner":"user1@coveo.com-google","sourceVisibility":"SHARED","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"42cc8f929afc411e9e5b1315fe6427e0","operationType":"INCREMENTAL_REFRESH","timestamp":1535593974282,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":97448},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source2"},{"sourceType":"PUSH","id":"zapierbetaOrg-source3","name":"Zapier test","owner":"user3@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"2dc4189e3b514572b0c0f275bf1260df","operationType":"INCREMENTAL_REFRESH","timestamp":1533937104194,"result":"SUCCESS","initialBuild":true,"numberOfDocuments":0},"numberOfDocuments":1,"documentsTotalSize":17},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user3@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source3"},{"sourceType":"PUSH","id":"zapierbetaOrg-source4","name":"ZapierDemo","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"6caa701f623d41cd9ed9f82b49f532fe","operationType":"INCREMENTAL_REFRESH","timestamp":1535593464541,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":1410},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source4"}]`
    );
    let privileges = [
      { type: 'VIEW', targetDomain: 'CUSTOM_DIMENSIONS', targetId: '*', owner: 'USAGE_ANALYTICS' },
      { targetDomain: 'EXECUTE_QUERY', targetId: '*', owner: 'SEARCH_API' },
      { type: 'EDIT', targetDomain: 'SOURCE', targetId: 'zapierbetaOrg-source2', owner: 'PLATFORM' }, /* source 1 */
      { type: 'VIEW', targetDomain: 'SOURCE', targetId: '*', owner: 'PLATFORM' },
      { targetDomain: 'VIEW_ALL_CONTENT', targetId: '*', owner: 'SEARCH_API' },
      { type: 'VIEW', targetDomain: 'FIELD', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ORGANIZATION', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SECURITY_CACHE', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ANALYTICS_DATA', targetId: '*', owner: 'USAGE_ANALYTICS' },
      { type: 'EDIT', targetDomain: 'SOURCE', targetId: 'zapierbetaOrg-source1', owner: 'PLATFORM' }, /* source 2 */
    ];

    sources = triggerUtils.filterSourcesWithPrivileges(sources, privileges);

    should.equal(2, sources.length);
    should.equal('zapierbetaOrg-source1', sources[0].id);
    should.equal('user1zapier', sources[0].name);
    should.equal('zapierbetaOrg-source2', sources[1].id);
    should.equal('user2@gmail.com test source', sources[1].name);
  });

  it('Test filter sources 3', function() {
    let sources = JSON.parse(
      `[{"sourceType":"PUSH","id":"zapierbetaOrg-source1","name":"user1zapier","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"fa149347e46847a5b7cffe915ec845f0","operationType":"INCREMENTAL_REFRESH","timestamp":1535137974295,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":30,"documentsTotalSize":4090772},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source1"},{"sourceType":"PUSH","id":"zapierbetaOrg-source2","name":"user2@gmail.com test source","owner":"user1@coveo.com-google","sourceVisibility":"SHARED","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"42cc8f929afc411e9e5b1315fe6427e0","operationType":"INCREMENTAL_REFRESH","timestamp":1535593974282,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":97448},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source2"},{"sourceType":"PUSH","id":"zapierbetaOrg-source3","name":"Zapier test","owner":"user3@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"2dc4189e3b514572b0c0f275bf1260df","operationType":"INCREMENTAL_REFRESH","timestamp":1533937104194,"result":"SUCCESS","initialBuild":true,"numberOfDocuments":0},"numberOfDocuments":1,"documentsTotalSize":17},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user3@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source3"},{"sourceType":"PUSH","id":"zapierbetaOrg-source4","name":"ZapierDemo","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"6caa701f623d41cd9ed9f82b49f532fe","operationType":"INCREMENTAL_REFRESH","timestamp":1535593464541,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":1410},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source4"}]`
    );
    let privileges = [
      { type: 'VIEW', targetDomain: 'CUSTOM_DIMENSIONS', targetId: '*', owner: 'USAGE_ANALYTICS' },
      { targetDomain: 'EXECUTE_QUERY', targetId: '*', owner: 'SEARCH_API' },
      { type: 'EDIT', targetDomain: 'SOURCE', targetId: 'zapierbetaOrg-source2', owner: 'PLATFORM' },
      { type: 'EDIT', targetDomain: 'SOURCE', targetId: '*', owner: 'PLATFORM' },  /* source ALL */
      { targetDomain: 'VIEW_ALL_CONTENT', targetId: '*', owner: 'SEARCH_API' },
      { type: 'VIEW', targetDomain: 'FIELD', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ORGANIZATION', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SECURITY_CACHE', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ANALYTICS_DATA', targetId: '*', owner: 'USAGE_ANALYTICS' },
    ];

    sources = triggerUtils.filterSourcesWithPrivileges(sources, privileges);

    should.equal(4, sources.length);
  });

  it('Test filter sources 4', function() {
    let sources = JSON.parse(
      `[{"sourceType":"PUSH","id":"zapierbetaOrg-source1","name":"user1zapier","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"fa149347e46847a5b7cffe915ec845f0","operationType":"INCREMENTAL_REFRESH","timestamp":1535137974295,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":30,"documentsTotalSize":4090772},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source1"},{"sourceType":"PUSH","id":"zapierbetaOrg-source2","name":"user2@gmail.com test source","owner":"user1@coveo.com-google","sourceVisibility":"SHARED","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"42cc8f929afc411e9e5b1315fe6427e0","operationType":"INCREMENTAL_REFRESH","timestamp":1535593974282,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":97448},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source2"},{"sourceType":"PUSH","id":"zapierbetaOrg-source3","name":"Zapier test","owner":"user3@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"2dc4189e3b514572b0c0f275bf1260df","operationType":"INCREMENTAL_REFRESH","timestamp":1533937104194,"result":"SUCCESS","initialBuild":true,"numberOfDocuments":0},"numberOfDocuments":1,"documentsTotalSize":17},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user3@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source3"},{"sourceType":"PUSH","id":"zapierbetaOrg-source4","name":"ZapierDemo","owner":"user1@coveo.com-google","sourceVisibility":"PRIVATE","information":{"sourceStatus":{"type":"PUSH_READY","allowedOperations":["DELETE"]},"lastOperation":{"id":"6caa701f623d41cd9ed9f82b49f532fe","operationType":"INCREMENTAL_REFRESH","timestamp":1535593464541,"result":"SUCCESS","initialBuild":false,"numberOfDocuments":0},"numberOfDocuments":5,"documentsTotalSize":1410},"pushEnabled":true,"onPremisesEnabled":false,"preConversionExtensions":[],"postConversionExtensions":[],"permissions":{"permissionLevels":[{"name":"Source Specified Permissions","permissionSets":[{"name":"Private","permissions":[{"allowed":true,"identityType":"USER","identity":"user1@coveo.com","securityProvider":"Email Security Provider"}]}]}]},"urlFilters":[{"filter":"*","includeFilter":true,"filterType":"WILDCARD"}],"resourceId":"zapierbetaOrg-source4"}]`
    );
    let privileges = [
      { type: 'VIEW', targetDomain: 'CUSTOM_DIMENSIONS', targetId: '*', owner: 'USAGE_ANALYTICS' },
      { targetDomain: 'EXECUTE_QUERY', targetId: '*', owner: 'SEARCH_API' },
      { type: 'VIEW', targetDomain: 'SOURCE', targetId: 'zapierbetaOrg-source2', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SOURCE', targetId: '*', owner: 'PLATFORM' },
      { targetDomain: 'VIEW_ALL_CONTENT', targetId: '*', owner: 'SEARCH_API' },
      { type: 'VIEW', targetDomain: 'FIELD', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ORGANIZATION', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'SECURITY_CACHE', targetId: '*', owner: 'PLATFORM' },
      { type: 'VIEW', targetDomain: 'ANALYTICS_DATA', targetId: '*', owner: 'USAGE_ANALYTICS' },
    ];

    sources = triggerUtils.filterSourcesWithPrivileges(sources, privileges);

    should.equal(0, sources.length);
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

      // First object
      let first = response[0];
      should.equal(Object.keys(first).length, 2);
      should.ok(first.id);
      should.ok(first.name);

      done();
    });
  });
});
