'use strict';

const messages = require('../messages');
const pushResource = require('../resources/push');
const pushHandler = require('../resources/pushHandler');

// This functions is a handoff to the pushHandler file to handle the creation of a push request, sending it
// to Coveo, then handling the appropriate response content.
const createNewPush = (z, bundle) => {
  // Take the fields the user submitted and put them into the input data to be sent in the push.
  Object.assign(bundle.inputData, bundle.inputData.fields);
  delete bundle.inputData.fields;
  // Sanitize documentId by removing hash and parameters (? & and # are not valid in documentIds)
  bundle.inputData.documentId = bundle.inputData.documentId.replace(/[?&#]/g, '=');

  if (!/^\w+:\/\/\w+/.test(bundle.inputData.documentId)) {
    // documentId is not an URL, which is a requirement for Push.
    // Stopping.
    throw new Error(messages.ERROR_DOCUMENT_ID_INVALID);
  }

  if (!bundle.inputData.clickableuri) {
    // Keep original url in clickableuri (if clickableuri isn't set already)
    bundle.inputData.clickableuri = bundle.inputData.documentId;
  }

  // Eliminate repeat url/file inputs in the Files input field
  if (bundle.inputData.content && bundle.inputData.content.length > 1) {
    bundle.inputData.content = [...new Set(bundle.inputData.content)];
  }

  // Move on to handling the push process
  return pushHandler.handlePushCreation(z, bundle);
};

// We recommend writing your creates separate like this and rolling them into the App definition at the end.
module.exports = {
  key: 'push',

  // You'll want to provide some helpful display labels and descriptions for users. Zapier will put them into the UI/UX.
  noun: 'Push',
  display: {
    label: 'Push or Update Content',
    description: 'Pushes or updates content to a specified push source.',
    important: true,
  },

  // `operation` is where the business logic goes.
  operation: {
    // App template input
    inputFields: [
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization',
        dynamic: 'orgChoices.id.displayName', // For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name', // For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'Please choose an Organization first.',
      },
      {
        key: 'documentId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID you want to give to your document. _It must be a URI_. You can use the original url, or create your own identifier like this: __app://*some-id*__\n\nFor more info see [Push API Reference](https://docs.coveo.com/en/78/cloud-v2-developers/push-api-reference#documentid-query-string-required).',
      },
      {
        key: 'title',
        required: true,
        type: 'string',
        label: 'Title',
        helpText: 'The title of the pushed document.',
      },
      {
        key: 'date',
        required: false,
        type: 'datetime',
        label: 'Date',
        helpText: 'The date of the document you are pushing in the source. Although optional, it\'s a good practice to use the last modified date (or the creation date) for this field to use sorting by date in your index.',
      },
      {
        key: 'clickableuri',
        required: false,
        type: 'string',
        label: 'Content Url',
        helpText:
          'A URL pointing to the original content you are pushing. Use this if you manually constructed the Document ID and still want a URL to your content, or you want an additional/alternate URL to the content in your submission.',
      },
      {
        key: 'content',
        required: false,
        type: 'file',
        label: 'Files',
        list: true, // Makes an 'infinite' list of input boxes for the user to put in files/urls
        helpText:
          'The main content of any files or URLs you want extracted into the source. Files or URLs that require authorization will not have the intended content extracted. If you wish to push multiple files in the form of an archive file, .zip, .tar, .tar.gz, and .tar.bz2 (as well as their short hands) are supported.',
      },
      {
        key: 'data',
        required: false,
        type: 'text',
        label: 'Document Body',
        helpText:
          'The main content of the document, when not using files. This text is usually interpreted as HTML content. You should use this when no valid files or URLs are supplied for content extraction.',
      },
      {
        key: 'fields',
        required: false,
        dict: true, // Creates input boxes for key value pairs, required for fields
        label: 'Fields',
        helpText:
          'Any fields your organization uses that you wish to map content to in your submission. Put the name of the field in the smaller box on the left, then the content of that field in the larger box on the right.',
      },
    ],
    // Action function
    perform: createNewPush,

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: pushResource.sample,

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: pushResource.outputFields,
  },
};
