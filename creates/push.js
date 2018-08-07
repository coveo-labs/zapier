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
    description: 'Push/Update Content to a Specified Push Source.',
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
        helpText: 'The ID of the source in the organization you wish to push to. This can only be chosen after the organization ID.',
      },
      {
        key: 'documentId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID of the document you want to use in the index. This MUST be in a url form. You can use a url or create your own identifier like this: app-name://ID.',
      },
      {
        key: 'title',
        required: true,
        type: 'string',
        label: 'Title of Submission',
        helpText: 'The title of the main submission to be displayed within the source content browser.',
      },
      {
        key: 'date',
        required: false,
        type: 'string',
        label: 'Date',
        helpText: 'The date of the of the content you are pushing into your source. If there are no available date options, you can manually construct it. This is not required, but highly recommended to make the content of the submission in the index more descriptive.',
      },
      {
        key: 'clickableuri',
        required: false,
        type: 'string',
        label: 'Url of the Document',
        helpText:
          'A url to the document. This is different from the document ID as this field provides you a url to the file you can click and it will always take you to the document from the url. You should use this field if you manually constructed the document ID and you have urls available as input options. If nothing is put here, the url in the Document ID field will be put here.',
      },
      {
        key: 'content',
        required: false,
        type: 'string',
        label: 'File',
        helpText:
          'The main content you want extracted into the source. This can be a URL or a file, which is displayed as (Exists but not shown). Files or urls that require authorization or are not in the proper format will fail. If you wish to push multiple files at once, .zip, .tar, .tar.gz, and .tar.bz2 (as well as their short hands) are supported. Any other tar compressions will not have the content extracted from them.',
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Plain Text',
        helpText:
          'The main content you want extracted into the source as plain text. This can be the text of a file, some free text you input, an HTML body, or a mix of any of these. Use this if no files or urls for the File field are supplied and you want content to be extracted into your push source. If both are supplied, then both will be pushed into the source.',
      },
      {
        key: 'fields',
        required: false,
        dict: true, //Creates input boxes for key value pairs, required for fields
        label: 'Fields',
        helpText:
          'Any fields you wish to map content to in your source. Put the name of the field in the smaller box on the left, then the content of that field in the larger box on the right. Be careful when typing the field names, as they are case sensitive and the spelling must be correct.',
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
