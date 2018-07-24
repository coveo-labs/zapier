'use strict';

const messages = require('../messages');
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
  // for users. Zapier will put them into the UX.
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
        helpText: 'The ID of the organization where your source is located. Must be chosen before the source ID.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name', //For user input and dynamic dropdown. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the source in the Coveo Cloud V2 Organization you wish to push to. Must be chosen after the organization ID. Note: the source must be a PUSH source.',
      },
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The main URL to your document or page you wish to push. Do not put urls that require authorization to access here (i.e. a gmail email url). If no urls are provided that do not require authorization, most apps provide and ID. You can do something like this: gmail://EMAIL_ID.',
      },
      {
        key: 'title',
        required: true,
        type: 'string',
        label: 'Title of Submission',
        helpText: 'The title to be displayed within the content browser.',
      },
      {
        key: 'content',
        required: false,
        type: 'string',
        label: 'File',
        helpText: 'The main content you want extracted into the source. This can be a URL or a file. Zapier displays files as (Exists but not shown). This will always be the content of the push submission if it does not fail or if the input supplied does not require authorization (i.e. a gmail email link). If you wish to push multiple files at once, .zip, .tar, .tar.gz, and .tar.bz2 are supported. The files in the archive file will be extracted and pushed to the source.', 
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Plain Text',
        helpText: 'The main content you want extracted into the source as plain text. This can be text of the file, free text, or a mix of both. Use this if no files or urls for the File field are supplied and you want content to be extracted with your push source. Will only be extracted if File field fails or is not supplied. If niether this nor the File field have any content, then no content will be extracted in the source. If both are supplied, then both will be pushed as a batch.', 
      },
      {
        key: 'field1',
        required: false,
        type: 'string',
        label: 'Field 1',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. Must choose the source ID and organization ID first.',
      },
      {
        key: 'field1Content',
        required: false,
        type: 'string',
        label: 'Field 1 Content',
        helpText: 'A url, text, files, or attachments you wish to push into Field 1.',
      },
      {
        key: 'field2',
        required: false,
        type: 'string',
        label: 'Field 2',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. Must choose the source ID and organization ID first.',
      },
      {
        key: 'field2Content',
        required: false,
        type: 'string',
        label: 'Field 2 Content',
        helpText: 'A url, text, files, or attachments you wish to push into Field 2.',
      },
      {
        key: 'field3',
        required: false,
        type: 'string',
        label: 'Field 3',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. Must choose the source ID and organization ID first.',
      },
      {
        key: 'field3Content',
        required: false,
        type: 'string',
        label: 'Field 3 Content',
        helpText: 'A url, text, files, or attachments you wish to push into Field 3.',
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
