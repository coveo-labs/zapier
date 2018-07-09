'use strict';

const pushResource = require('../resources/push');
const pushHandler = require('../resources/pushHandler');

const createNewPush = (z, bundle) => {

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
    label: 'Push or Update a Single Item',
    description: 'Push/Update an Item to a Specified Push Source.',
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
        dynamic: 'orgChoices.id.displayName',
        helpText: 'The ID of the organization where your source is located. Must be chosen before the source.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name',
        helpText: 'The ID of the source in the Coveo Cloud V2 Organization you wish to push to. Must be chosen after the organization.',
      },
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The main URL to your document or page you wish to push.',
      },
      {
        key: 'platform',
        required: true,
        label: 'Platform',
        choices: {'pushdev.cloud.coveo.com': 'Dev'},
        helpText: 'The platform in which your organization lives.',
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
        required: true,
        type: 'string',
        label: 'Files or Attachments',
        helpText: 'File or attachment you wish to push relating to the Document ID. In Zapier, most apps display these as: (Exists but not shown).', 
      },
      {
        key: 'field1',
        required: false,
        type: 'string',
        label: 'Field 1',
        dynamic: 'sourceFields.fieldName',
        helpText: 'The name of a field that your source uses as a mapping. Must choose the source and organization first.',
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
        helpText: 'The name of a field that your source uses as a mapping. Must choose the source and organization first.',
      },
      {
        key: 'field2Content',
        required: false,
        type: 'string',
        label: 'Field 2 Content',
        helpText: 'A url, text, files, or attachments you wish to push into Field 2.',
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
