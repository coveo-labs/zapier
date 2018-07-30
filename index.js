const DeleteResource = require('./resources/delete');
const PushResource = require('./resources/push');
const push = require('./creates/push');
const deletes = require('./creates/delete');
const authentication = require('./authentication');
const orgChoices = require('./triggers/orgChoices');
const orgSources = require('./triggers/orgSources');
const sourceFields = require('./triggers/fieldChoices');
const {includeBearerToken} = require('./before-handlers');

// Now we can roll up all our behaviors in an App.
const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  //Include authentication
  authentication: authentication,

  //Whenever an outbound request is made, this will be called before the request is sent.
  beforeRequest: [
    includeBearerToken,
  ],

  //Whenever a response from a request is obtained, you can add calls in here (may be useful for responseContent.js later on).
  afterResponse: [
  ],

  //Include resources in the app so that the creates can access the methods from within
  resources: {
    [PushResource.key]: PushResource,
    [DeleteResource.key]: DeleteResource,
  },

  // If you want your trigger to show up, you better include it here! These need to be included for creates to generate dynamic drop downs
  triggers: {
    [orgChoices.key]: orgChoices,
    [orgSources.key]: orgSources,
    [sourceFields.key]: sourceFields,
  },

  // If you want your searches to show up, you better include it here!
  searches: {
  },

  // If you want your creates to show up, you better include it here! Push/delete are included here
  creates: {
    [push.key]: push,
    [deletes.key]: deletes,
  },
};

// Finally, export the app.
module.exports = App;
