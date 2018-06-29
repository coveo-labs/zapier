'use strict';

module.exports = {

  key: 'delete',
  noun: 'Delete',

  sample: {
    docId: 'file://folder/my-file.html',
    sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
    orgId: 'mycoveocloudv2organizationg8tp8wu3',
    platform: 'push.cloud.coveo.com',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: [
    {key: 'documentId', label: 'Document ID'},
    {key: 'sourceId', label: 'Source ID'},
    {key: 'orgId', label: 'Organization ID'},
    {key: 'platform', label: 'Platform'},
  ],

};
