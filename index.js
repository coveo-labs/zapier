const PushResource = require('./resources/push');
const push = require('./creates/push');
const deletes = require('./creates/delete');
const authentication = require('./authentication');
const {includeBearerToken} = require('./before-handlers');

// Now we can roll up all our behaviors in an App.
const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [
	includeBearerToken
  ],

  afterResponse: [
  ],

  resources: {
    [PushResource.key]: PushResource,
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
  },

  // If you want your searches to show up, you better include it here!
  searches: {
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [push.key]: push,
    [deletes.key]: deletes,
  }
};

// Finally, export the app.
module.exports = App;
