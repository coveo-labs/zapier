'use strict';

const pushResource = require('../resources/push');
const pushHandler = require('../resources/pushHandler');

//This functions is a handoff to the pushHandler file to handle the creation of a push request, sending it
//to Coveo, then handling the appropriate response content.
const createNewPush = (z, bundle) => {

  //Take the fields the user submitted and put them into the input data
  //to be sent in the push.
  Object.assign(bundle.inputData, bundle.inputData.fields);
  delete bundle.inputData.fields;

  if (!bundle.inputData.clickableuri) {
    //Keep original url in clickableuri (if clickableuri isn't set already)
    bundle.inputData.clickableuri = bundle.inputData.documentId;
  }
  //Sanitize documentId by removing hash and parameters (? & and # are not valid in documentIds)
  bundle.inputData.documentId = bundle.inputData.documentId.replace(/[?&#]/g, '=');

  //Move on to handling the push process
  return pushHandler.handlePushCreation(z, bundle);
};

//We recommend writing your creates separate like this and rolling them
//into the App definition at the end.
module.exports = {
  key: 'push',

  //You'll want to provide some helpful display labels and descriptions
  //for users. Zapier will put them into the UI/UX.
  noun: 'Push',
  display: {
    label: 'Push or Update Content',
    description: 'Push or Update Content to a Specified Push Source.',
    important: true,
  },

  //`operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization',
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the organization where your source is located.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the source in the organization you wish to push to. This must be chosen after the organization ID.',
      },
      {
        key: 'documentId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID of the document you want to use in the index. This MUST be in a url form. You can use a url or create your own url with an identifier like this: app-name://ID.',
      },
      {
        key: 'title',
        required: true,
        type: 'string',
        label: 'Title of Submission',
        helpText: 'The title of the submission to be displayed within the source. This would be the title of the parent item sent in a push.',
      },
      {
        key: 'date',
        required: false,
        type: 'string',
        label: 'Date',
        helpText: 'The date of the of the content you are pushing into your source. Even though this is not required, it is highly recommended.',
      },
      {
        key: 'clickableuri',
        required: false,
        type: 'string',
        label: 'Url of the Document',
        helpText:
          'A url to the document. Use this if you manually constructed the Document ID and still want a url to your document, or you want an additional/alternate url to the document in your submission.',
      },
      {
        key: 'content',
        required: false,
        type: 'string',
        label: 'File',
        helpText:
          'The main content you want extracted into the source. Files or urls that require authorization or are not in the proper format will fail. If you wish to push multiple files at once, .zip, .tar, .tar.gz, and .tar.bz2 (as well as their short hands) are supported.',
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Plain Text',
        helpText:
          'The main content you want extracted into the source as plain text. This can be the text of a file, any text you input, an HTML body, or a mix of these. Use this if no files or urls are supplied for content extraction. If this and a valid file or url are supplied for extraction, then both will be pushed into the source.',
      },
      {
        key: 'fields',
        required: false,
        dict: true, //Creates input boxes for key value pairs, required for fields
        label: 'Fields',
        helpText:
          'Any fields your organization uses that you wish to map content to in your submission. Put the name of the field in the smaller box on the left, then the content of that field in the larger box on the right.',
      },
    ],
    //Action function
    perform: createNewPush,

    //In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    //from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    //returned records, and have obviously dummy values that we can show to any user.
    sample: pushResource.sample,

    //If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    //field definitions. The result will be used to augment the sample.
    //outputFields: () => { return []; }
    //Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: pushResource.outputFields,
  },
};
