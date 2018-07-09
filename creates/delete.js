'use strict';

const deleteResource = require('../resources/delete');
const deleteHandler = require('../resources/deleteHandler');

const createDelete = (z, bundle) => {

  return deleteHandler.handleDeleteCreation(z, bundle);

};

module.exports = {
  key: 'deletes',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Delete',
  display: {
    label: 'Delete Item From Source',
    description: 'Delete content from a specified push source.',
  },

  // `operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID of the document you wish to delete, the url provided when indexing.',
      },
      {
        key: 'title',
        required: false,
        type: 'string',
        label: 'Title of Document',
        helpText: 'The title of the document being deleted. Only needed if you want output to be more descriptive.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID',
        helpText: 'The ID of the source inside of your organization.',
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization ID',
        helpText: 'The ID of the organization within your platform.',
      },
      {
        key: 'platform',
        required: true,
        label: 'Platform',
        choices: {'pushdev.cloud.coveo.com': 'Dev'},
        helpText: 'The platform in which your organization lives.',
      },
    ],
    //Action function
    perform: createDelete,

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: deleteResource.sample,

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: deleteResource.outputFields,
  },
};
