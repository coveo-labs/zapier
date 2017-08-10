const base64 = require('base-64');
const pako = require('pako');

//https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// We recommend writing your creates separate like this and rolling them
// into the App definition at the end.
module.exports = {
  key: 'push',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Push',
  display: {
    label: 'Push Url',
    description: 'Push URL content to Push Source.'
  },

  // `operation` is where the business logic goes.
  operation: {
    inputFields: [
      { key: 'text', required: true, type: 'string' },
      { key: 'docId', required: true, type: 'string' },
      { key: 'sourceId', required: true, type: 'string' },
      { key: 'orgId', required: true, type: 'string' },
      { key: 'apiKey', required: true, type: 'string' },
      { key: 'platform', required: true, choices: { 'pushdev.cloud.coveo.com': 'dev', 'pushqa.cloud.coveo.com': 'qa', 'push.cloud.coveo.com': 'prod' } }
    ],
    perform: (z, bundle) => {
      const compressed = base64.encode(pako.deflate(bundle.inputData.text, { to: 'string' }));
      var promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'PUT',
        body: JSON.stringify({
          CompressedBinaryData: compressed
        }),
        params: {
          documentId: encodeURI(bundle.inputData.docId)
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bundle.inputData.apiKey}`
        }
      });

      return promise.then((response) => JSON.parse(response.content));
    },

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: {
      "error": "Failed to connect"
    },

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    // outputFields: {}
  }
};
