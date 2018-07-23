'use strict';

const badDocID = require('../messages').BAD_DOC_ID;
const deleteResource = require('../resources/delete');
const deleteHandler = require('../resources/deleteHandler');

//This creates needs to perform something when executed on the app. This functions is
//a handoff to the deleteHandler file to handle the creation of a delete request, sending it
//to Coveo, then handling the appropriate response content.
const createDelete = (z, bundle) => {

  //Check the doc ID, all urls with # in them do not index properly, so just
  //tell the user this and prevent them from doing so.
  if(bundle.inputData.docId.indexOf('#') > -1){
    throw new Error(badDocID);
  }

  bundle.inputData['documentId'] = bundle.inputData.docId;
  delete bundle.inputData.docId;

  return deleteHandler.handleDeleteCreation(z, bundle);

};

module.exports = {
  key: 'deletes',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Delete',
  display: {
    label: 'Delete Content',
    description: 'Delete content from a specified push source.',
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
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic dropdown. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the organization within your platform.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID',
        dynamic: 'orgSources.id.name', //For user input and dynamic dropdown. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'The ID of the source inside of your organization. Must be chosen after the organization ID. Note: the source must be a PUSH source.',
      },
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The ID of the document you wish to delete. Children of the document ID supplied will also be deleted. Children of the document that are indexed have the same url with /attachment# appended to it when pushed through Zapier. If you wish to delete specific children, simply add /attachment#. Example: `https://example/com/attachment2`.',
      },
      {
        key: 'title',
        required: false,
        type: 'string',
        label: 'Title of Document',
        helpText: 'The title of the document being deleted. Only needed if you want possible inputs for additional actions to have more content.',
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
