'use strict';

const outputFields = () => {

  //This is how Zapier handles outputs from responses on the app. It looks at the
  //object returned from a function in perform, matches the keys declared here to those
  //in the returned object, then displays the values corresponding to those keys. The label
  //tag is what is displayed to be readable and make more sense to the user when they see it.
  const output = [
    {key: 'lq', label: 'Query Sent to Coveo'},
    {key: 'sortCriteria', label: 'How the Documents Were Sorted'},
    {key: 'numberOfResults', label: 'Number of Documents Searched For'},
    {key: 'organizationId', label: 'Organization Searched'},
  ];

  return output;

};

module.exports = {  
  key: 'query',
  noun: 'Query',

  //Samples are used for the output of the app if no
  //fetch can be performed or some issues getting the details occurs.
  sample: {
    lq: 'What is Coveo for Sitecore?',
    organizationId: 'coveo-organization-id',
    numberOfResults: '6',
  },

  //If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  //field definitions. The result will be used to augment the sample.
  //outputFields: () => { return []; }
  //Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),

};