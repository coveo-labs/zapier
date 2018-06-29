'use strict';

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

  outputFields: [
    {key: 'documentId', label: 'Document'},
    {key: 'orgId', label: 'Organization'},
    {key: 'sourceId', label: 'Source'},
    {key: 'platform', label: 'Platform'},
    {key: 'title', label: 'Title'},
    {key: 'content', label: 'Files'},
    {key: 'thumbnail', label: 'Thumbnail'},
    {key: 'documentdownload', label: 'Download Links'},
  ],
};
