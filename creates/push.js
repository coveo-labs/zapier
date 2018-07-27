'use strict';

const pushResource = require('../resources/push');
const pushHandler = require('../resources/pushHandler');
const _ = require('lodash');

//This creates needs to perform something when executed on the app. This functions is
//a handoff to the pushHandler file to handle the creation of a push request, sending it
//to Coveo, then handling the appropriate response content.
const createNewPush = (z, bundle) => {
  //Set the field names as properties and the values of these new properties
  //to what the user put as the content for these fields. Not sure if there's a better
  //way of doing this.
  bundle.inputData[bundle.inputData.field1] = bundle.inputData.field1Content;
  bundle.inputData[bundle.inputData.field2] = bundle.inputData.field2Content;
  bundle.inputData[bundle.inputData.field3] = bundle.inputData.field3Content;
  bundle.inputData['documentId'] = bundle.inputData.docId.replace(/[?&#]/g, '=');
  bundle.inputData['uri'] = bundle.inputData.docId;

  //Don't need these components of the bundle anymore after assigning the content of each field
  //to the field name in the bundle, so remove them from the bundle and carry on.
  bundle.inputData = _.omit(bundle.inputData, ['field1', 'field2', 'field3', 'docId', 'field1Content', 'field2Content', 'field3Content']);

  //Move on to handling the push process
  return pushHandler.handlePushCreation(z, bundle);
};

// We recommend writing your creates separate like this and rolling them
// into the App definition at the end.
module.exports = {
  key: 'push',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UI/UX.
  noun: 'Push',
  display: {
    label: 'Push or Update Content',
    description: 'Push/Update Content to a Specified Push Source.',
    important: true,
  },

  // `operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization',
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic dropdown. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the organization where your source is located.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name', //For user input and dynamic dropdown. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the source in the organization you wish to push to. This can only be chosen after the organization ID.',
      },
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText:
          'The ID of the document you want to use in the index. This MUST be in a url form. You can use the original url or create your own identifier like this: gmail://EMAIL_ID.',
      },
      {
        key: 'title',
        required: true,
        type: 'string',
        label: 'Title of Submission',
        helpText: 'The title of the content to be displayed within the source content browser.',
      },
      {
        key: 'content',
        required: false,
        type: 'string',
        label: 'File',
        helpText: 'The main content you want extracted into the source. This can be a URL or a file. Zapier displays files as (Exists but not shown). This will always be the content of the push submission if it does not fail or if the input supplied does not require authorization (i.e. a gmail email link). If you wish to push multiple files at once, .zip, .tar, .tar.gz (.tgz), and .tar.bz2 (.tbz2) are supported. The files in these archive files will be extracted and pushed to the source. Other archive file types besides these will have no content extracted. Only supply one url or file here, otherwise no content will be extracted.', 
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Plain Text',
        helpText: 'The main content you want extracted into the source as plain text. This can be text of a file, some free text you input, an HTML body, or a mix of any of these. Use this if no files or urls for the File field are supplied and you want content to be extracted into your push source. If niether this nor the File field have any content, then no content will be extracted in the source. If both are supplied, then both will be pushed into the source.', 
      },
      {
        key: 'field1',
        required: false,
        type: 'string',
        label: 'Field 1',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. You must choose the source ID and organization ID first to see these options.',
      },
      {
        key: 'field1Content',
        required: false,
        type: 'string',
        label: 'Field 1 Content',
        helpText: 'Any content you wish to assign to Field 1 when the push is made to the source.',
      },
      {
        key: 'field2',
        required: false,
        type: 'string',
        label: 'Field 2',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. You must choose the source ID and organization ID first to see these options.',
      },
      {
        key: 'field2Content',
        required: false,
        type: 'string',
        label: 'Field 2 Content',
        helpText: 'Any content you wish to assign to Field 1 when the push is made to the source.',
      },
      {
        key: 'field3',
        required: false,
        type: 'string',
        label: 'Field 3',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. You must choose the source ID and organization ID first to see these options.',
      },
      {
        key: 'field3Content',
        required: false,
        type: 'string',
        label: 'Field 3 Content',
        helpText: 'Any content you wish to assign to Field 1 when the push is made to the source.',
      },
    ],
    //Action function
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
