'use strict';

const outputFields = () => {
  // This is how Zapier handles outputs from responses on the app. It looks at the
  // object returned from a function in perform, matches the keys declared here to those
  // in the returned object, then displays the values corresponding to those keys. The label
  // tag is what is displayed to be readable and make more sense to the user when they see it.
  const output = [
    { key: 'clickableuri', label: 'Clickable Document URL' },
    { key: 'data', label: 'Plain Text Content' },
    { key: 'date', label: 'Date of Document Creation' },
    { key: 'documentId', label: 'Document ID' },
    { key: 'organizationId', label: 'Organization ID' },
    { key: 'sourceId', label: 'Source ID' },
    { key: 'title', label: 'Pushed Document Title' },
  ];

  return output;
};

module.exports = {
  key: 'push',
  noun: 'Push',

  // Samples are used for the output of the app if no fetch can be performed or some issues getting the details occurs.
  sample: {
    organizationId: 'coveo-organization-id',
    sourceId: 'coveo-source-id',
    documentId: 'http://example.com/',
    title: 'my-file.html',
    date: '2018-08-28T10:53:50-04:00',
    clickableuri: 'http://example.com/',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),
};
