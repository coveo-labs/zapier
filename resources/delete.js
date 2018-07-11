'use strict';

const responseContent = require('./responseContent');
const numFields = responseContent.fieldsCount;

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
    docId: 'file://folder/my-file.html',
    title: 'my-doc.txt',
    sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
    orgId: 'mycoveocloudv2organizationg8tp8wu3',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),

};
