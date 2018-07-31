'use strict';

const deleteResource = require('../resources/delete');
const deleteHandler = require('../resources/deleteHandler');

//This creates needs to perform something when executed on the app. This functions is
//a handoff to the deleteHandler file to handle the creation of a delete request, sending it
//to Coveo, then handling the appropriate response content.
const createDelete = (z, bundle) => {

  bundle.inputData.documentId = bundle.inputData.documentId.replace(/[?&#]/g, '=');

  return deleteHandler.handleDeleteCreation(z, bundle);
};

module.exports = {
  key: 'deletes',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Delete',
  display: {
    label: 'Delete Content',
    description: 'Delete Content From a Specified Push source.',
  },

  // `operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization ID',
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the organization within your platform.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID',
        dynamic: 'orgSources.id.name', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the source inside of your organization. Must be chosen after the organization ID.',
      },
      {
        key: 'documentId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID of the document you wish to delete. Children of the document ID supplied will also be deleted. Children of the document that are indexed have the same url with /file# appended to it when pushed through Zapier, like this: DOC_ID/file#. If you wish to delete specific children, simply add /file#. Example: `https://example.com/file2`.',
      },
      {
        key: 'title',
        required: false,
        type: 'string',
        label: 'Title of Document',
        helpText: 'The title of the document ID being deleted. Only needed if you want more detailed output of this action.',
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
