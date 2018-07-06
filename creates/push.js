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
        helpText: 'The ID of the organization where your source is located.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID',
        helpText: 'The ID of the source in the Coveo Cloud V2 Organization you wish to push to.',
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
        label: 'Files',
        helpText: 'The file or attachments you wish to push. In Zapier, most apps display these as (exists but not shown). This is currently the field to extract file data into the source.', 
      },
      {
        key: 'thumbnail',
        required: false,
        type: 'string',
        label: 'Thumbnail',
        helpText: 'Thumbnail to go with the main url supplied.',
      },
      {
        key: 'additional',
        required: false,
        type: 'string',
        label: 'Additional Content',
        helpText: 'Any additional links or content you wish to push.',
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
