'use strict';

const queryResource = require('../resources/query');
const handleQuery = require('../resources/queryHandler').handleQuery;

//This is a handoff to the queryHandler. This sets up the defaults of some 
//of the values if none were provided in the input fields. 
const searchOrgQuery = (z, bundle) => {
  //Default number of documents to get and display
  //and make sure the number isn't bigger than 10.
  if(!bundle.inputData.numberOfResults || typeof bundle.inputData.numberOfResults !== 'number'){
    bundle.inputData.numberOfResults = 3;
  } else if (bundle.inputData.numberOfResults > 10){
    bundle.inputData.numberOfResults = 10;
  }

  //Default sorting of the documents
  if(!bundle.inputData.sortCriteria){
    bundle.inputData.sortCriteria = 'Relevancy';
  }
  
  //Send off to the handler
  return handleQuery(z, bundle);
};

//We recommend writing your searches separate like this and rolling them
//into the App definition at the end.
module.exports = {
  key: 'orgQuery',
  noun: 'Query',

  //You'll want to provide some helpful display labels and descriptions
  //for users. Zapier will put them into the UI/UX.
  display: {
    label: 'Find Documents',
    description: 'Find documents in a specified organization.',
    important: true,
  },

  //`operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'organizationId',
        type: 'string',
        required: true,
        label: 'Organization',
        dynamic: 'orgChoices.id.displayName', //For user input and dynamic drop down. Do not remove. The first component is the trigger key where to find the function to perform here, the second is the value to put as the input, and the last is how it is displayed (readable).
      },
      { 
        key: 'lq',
        type: 'string', 
        required: true,
        label: 'Search Query',
        helpText: 'The search query to find documents. The query should follow the [Coveo Cloud Query Syntax](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=357).',
      },
      {
        key: 'sortCriteria',
        type: 'string',
        required: false,
        label: 'Sort By',
        choices: {'Relevancy': 'Relevance', 'DateDescending': 'Newest to Oldest', 'DateAscending': 'Oldest to Newest', 'qre': 'Match Strength'},
        helpText: 'Choose how to sort the retrieved documents. Default is `Relevancy`.',
      },
      {
        key: 'numberOfResults',
        type: 'integer',
        required: false,
        label: 'Number of Documents',
        choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        helpText: 'The number of documents you wish to fetch in your result. Default is `3`, maximum is `10`.',
      },
    ],

    //Action function
    perform: searchOrgQuery,

    //In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    //from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    //returned records, and have obviously dummy values that we can show to any user.
    sample: queryResource.sample,

    //If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    //field definitions. The result will be used to augment the sample.
    //outputFields: () => { return []; }
    //Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: queryResource.outputFields,
  },
};
