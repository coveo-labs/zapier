'use strict';

const outputFields = () => {

  //This is how Zapier handles outputs from responses on the app. It looks at the
  //object returned from a function in perform, matches the keys declared here to those
  //in the returned object, then displays the values corresponding to those keys. The label
  //tag is what is displayed to be readable and make more sense to the user when they see it.
  const output = [
    {key: 'documentId', label: 'Deleted Document ID'},
    {key: 'orgName', label: 'Organization Name'},
    {key: 'orgId', label: 'Organization ID'},
    {key: 'orgOwner', label: 'Organization Owner'},
    {key: 'sourceName', label: 'Source Name'},
    {key: 'sourceId', label: 'Source ID'},
    {key: 'sourceOwner', label: 'Source Owner'},
    {key: 'sourceType', label: 'Source Type'},
    {key: 'numDocs', label: 'Number of Documents in Source'},
    {key: 'title', label: 'Deleted Document Title'},
    {key: 'docSize', label: 'Size of all the Documents in the Source'},
  ];

  return output;

};

module.exports = {

  key: 'delete',
  noun: 'Delete',

  //Samples are used for the output of the app if no
  //fetch can be performed or some issues getting the details occurs.
  sample: {
    docId: 'http://example.com/',
    title: 'my-doc.txt',
    sourceId: 'coveo-source-id',
    orgId: 'coveo-organization-id',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),

};
