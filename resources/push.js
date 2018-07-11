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
    {key: 'content', label: 'File(s) Pushed'},
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
  key: 'push',
  noun: 'Push',

  sample: {
    docId: 'file://folder/my-file.html',
    sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
    orgId: 'mycoveocloudv2organizationg8tp8wu3',
    title: 'my-file.html',
    content: '<files here>',
    field1: 'thumbnail',
    field1Content: '<thumbnail url here>',
    field2: 'additionalcontent',
    field2Content: '<any other content here>',	
  },

  outputFields: outputFields(),

};
