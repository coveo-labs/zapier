const base64 = require('base-64');
const pako = require('pako');

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
    //App template input
    inputFields: [
      {
        key: 'metadata',
        required: false,
        type: 'string',
        label: 'Metadata',
        helpText: 'Zapier is weird, so you need to pass your metadata as=> key:data',
        list: true
      },
      {
        key: 'binaryData',
        required: false,
        type: 'string',
        label: 'Binary Data',
        helpText: 'The data placed in the CompressedBinaryData field'
      },
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID (url)',
        helpText: 'The document ID, usually a URL'
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID'
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Cloud V2 Organization ID'
      },
      {
        key: 'apiKey',
        required: true,
        type: 'string',
        label: 'Push API key'
      },
      {
        key: 'platform',
        required: true,
        choices: { 'pushdev.cloud.coveo.com': 'dev', 'pushqa.cloud.coveo.com': 'qa', 'push.cloud.coveo.com': 'prod' },
        helpText: 'The platform in which your org lives in'
      }
    ],
    //Action function
    perform: (z, bundle) => {
      let compressed = ""
      if(bundle.inputData.binaryData){
        compressed = base64.encode(pako.deflate(bundle.inputData.binaryData, { to: 'string' }));
      }
      let jsonToSend = {
        CompressedBinaryData: compressed,
        compressionType: 'Zlib'
      };
      if (bundle.inputData.metadata) {
        for (let i = 0; i < bundle.inputData.metadata.length; i++) {
          let splitString = bundle.inputData.metadata[i].split(':');
          let key = splitString[0];
          let data = splitString.slice(1).join(':')
          jsonToSend[key] = data;
        }
      }
      let promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'PUT',
        body: JSON.stringify(jsonToSend),
        params: {
          documentId: encodeURI(bundle.inputData.docId)
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bundle.inputData.apiKey}`
        }
      });

      return promise.then(response => {
        if (response.content !== 'null') {
          throw new z.errors.HaltedError(z.JSON.stringify(response.content));
        }
        return { key: response.content };
      }
      );
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
    outputFields: [{ key: 'null' }]
  }
};
