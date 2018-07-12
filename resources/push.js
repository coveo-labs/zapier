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
    {key: 'content', label: 'File(s) Pushed'},
    {key: 'numFields', label: 'Number of Fields the Source Uses'},
    {key: 'docSize', label: 'Size (in bytes) of all the Documents in the Source'},
  ];

  //This loop is needed to put the response content I constructed into how Zapier handles output.
  //I have the fields the source uses marked as 'Field #i used by source' in my response content,
  //so I have to manually construct all of these keys and labels like above. Example: orgId is returned
  //after a push or delete. Zapier looks in the response object for a property called orgId, and displays
  //the label with the orgId value from the object as output, so it would display 
  //Organization ID <orgId here> on the app output on Zapier's site. This is for actions that occur after
  //this is returned.
  for(var i = 0; i < numFields; i++){
    var tempKey = 'Field #' + (i + 1) + ' used by source';
    output.push({key: tempKey, label: tempKey});
  }

  return output;

};

module.exports = {  
  key: 'push',
  noun: 'Push',

  sample: {
    docId: 'http://example.com/',
    sourceId: 'coveo-source-id',
    orgId: 'coveo-organization-id',
    title: 'my-file.html',
    content: 'content-to-extract',
    field1: 'coveo-source-field-1',
    field1Content: 'coveo-source-field-1-content',
    field2: 'coveo-source-field-2',
    field2Content: 'coveo-source-field-2-content',	
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),

};
