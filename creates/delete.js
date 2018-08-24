'use strict';

const deleteResource = require('../resources/delete');
const deleteHandler = require('../resources/deleteHandler');

//This functions is a handoff to the deleteHandler file to handle the creation of a delete request, sending it
//to Coveo, then handling the appropriate response content.
const createDelete = (z, bundle) => {

  //Sanitize documentId by removing hash and parameters (? & and # are not valid in documentIds)
  bundle.inputData.documentId = bundle.inputData.documentId.replace(/[?&#]/g, '=');

  return deleteHandler.handleDeleteCreation(z, bundle);
};

module.exports = {
  key: 'deletes',

  //You'll want to provide some helpful display labels and descriptions
  //for users. Zapier will put them into the UX.
  noun: 'Delete',
  display: {
    label: 'Delete Content',
    description: 'Delete content from a specified push source.',
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
        label: 'Organization ID',
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source',
        dynamic: 'orgSources.id.name', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
        helpText: 'Please choose an Organization first.',
      },
      {
        key: 'documentId',
        required: true,
        type: 'string',
        label: 'Item ID',
        helpText: 'The ID of the item you wish to delete. It should follow a URL format. If you wish to delete a specific child item of a parent item, simply add `/file#` to the item ID ( e.g., `ITEM_ID/file2`).',
      },
      {
        key: 'title',
        required: false,
        type: 'string',
        label: 'Item Title',
        helpText: 'The title of the content being deleted. Use this if you want more detailed output of this action.',
      },
    ],
    //Action function
    perform: createDelete,

    //In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    //from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    //returned records, and have obviously dummy values that we can show to any user.
    sample: deleteResource.sample,

    //If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    //field definitions. The result will be used to augment the sample.
    //outputFields: () => { return []; }
    //Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: deleteResource.outputFields,
  },
};
