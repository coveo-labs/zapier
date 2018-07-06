'use strict';

const responseContent = require('./responseContent');
const numFields = responseContent.numFields;

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
    {key: 'platform', label: 'Platform'},
    {key: 'title', label: 'Pushed Document Title'},
    {key: 'content', label: 'File(s) Pushed'},
    {key: 'thumbnail', label: 'Thumbnail'},
    {key: 'additionalcontent', label: 'Additional Content'},
  ];

  for(var i = 0; i < numFields; i++){
    var tempKey = 'Field #' + (i + 1).toString();
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
    platform: 'push.cloud.coveo.com',
    title: 'my-file.html',
    content: '<files here>',
    thumbnail: '<thumnail url>',
    download: '<download links here>',	
  },

  outputFields: outputFields(),

};
