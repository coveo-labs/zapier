'use strict';

const numFields = require('./responseContent').fieldsCount;

const outputFields = () => {

  const output = [
    {key: 'documentId', label: 'Document ID'},
    {key: 'orgName', label: 'Organization Name'},
    {key: 'orgId', label: 'Organization ID'},
    {key: 'orgOwner', label: 'Organization Owner'},
    {key: 'sourceName', label: 'Source Name'},
    {key: 'sourceId', label: 'Source ID'},
    {key: 'sourceOwner', label: 'Source Owner'},
    {key: 'sourceType', label: 'Source Type'},
    {key: 'numDocs', label: 'Number of Documents in Source'},
    {key: 'title', label: 'Pushed Document Title'},
    {key: 'numFields', label: 'Number of Fields the Source Uses'},
    {key: 'docSize', label: 'Size (in bytes) of all the Documents in the Source'},
  ];

  //This loop is needed to put the response content I constructed into how Zapeier handles it.
  //I have the fields the source uses marked as 'Field #i used by source' in my response content,
  //so I have to manually construct all of these keys and labels like above. Example: orgId is returned
  //after a push or delete. Zapier looks in the response object for a property called orgId, and displays
  //the label with the orgId valie from the object as output. This is for actions that occur after
  //this is returned.
  for(var i = 0; i < numFields; i++){
    var tempKey = 'Field #' + (i + 1) + ' used by source';
    output.push({key: tempKey, label: tempKey});
  }

  return output;

};

module.exports = {

  key: 'delete',
  noun: 'Delete',

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
