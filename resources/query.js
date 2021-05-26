'use strict';

const outputFields = () => {
  // This is how Zapier handles outputs from responses on the app.
  // It looks at the object returned from a function in perform, matches the keys declared here to those in the returned object,
  // then displays the values corresponding to those keys.
  // The label tag is what is displayed to be readable and make more sense to the user when they see it.
  const output = [
    { key: 'clickUri', label: 'Uri to use in web results getting back to the original document' },
    { key: 'excerpt', label: 'Excerpt from the document matching the query' },
    { key: 'isRecommendation', type: 'boolean', label: 'Is this result a recommendation from Machine Learning?' },
    { key: 'isTopResult', type: 'boolean', label: 'Is this result a configured Top Result?' },
    { key: 'raw.concepts', label: 'Concepts extracted from the document' },
    { key: 'raw.date', label: 'Date set for the document' },
    { key: 'raw.documenttype', label: 'Document type' },
    { key: 'raw.indexeddate', label: 'Datetime when this document was indexed.' },
    { key: 'raw.permanentid', label: 'Permanent id' },
    { key: 'raw.size', label: 'Document size' },
    { key: 'raw.source', label: 'Name of the source for this document' },
    { key: 'raw.sourcetype', label: 'Type of the source for this document' },
    { key: 'raw.title', label: 'Document title' },
    { key: 'raw.uri', label: 'URI of the document (aka. Document Id)' },
    { key: 'raw.urihash', label: 'URI as a hashed value' },
    { key: 'score', type: 'integer', label: 'Score returned by the search for this document' },
    { key: 'title', label: 'Document title' },
    { key: 'uniqueId', label: 'Unique id used in the index' },
    { key: 'uri', label: 'URI of the document (aka. Document Id)' },
  ];

  return output;
};

module.exports = {
  key: 'query',
  noun: 'Query',

  // Samples are used for the output of the app if no fetch can be performed or some issues getting the details occurs.
  sample: {
    clickUri: 'https://docs.coveo.com/en/690/',
    excerpt: 'You have used Coveo for Sitecore a long time ago and you want to know what changed?',
    isRecommendation: true,
    isTopResult: false,
    printableUri: 'https://docs.coveo.com/en/690/',
    raw: {
      clickableuri: 'https://docs.coveo.com/en/690/',
      concepts: 'Coveo Analytics ; sitecore ; Automatic Boosting ; Machine Learning',
      date: 1533158432000,
      documenttype: 'WebPage',
      indexeddate: 1533366254000,
      permanentid: 'cc4c5a22345b74a1ac60daea7ff10902bb9a369b98f5e942714f1b9148e8',
      size: 15701,
      source: 'docs.coveo.com',
      sourcetype: 'Sitemap',
      title: 'What Is Coveo for Sitecore?',
      uri: 'https://docs.coveo.com/en/690/',
      urihash: 'ñbzYR2sytpmP8aFh',
    },
    score: 9043,
    title: 'What Is Coveo for Sitecore?',
    uniqueId: '42.34281$https://docs.coveo.com/en/690/',
    uri: 'https://docs.coveo.com/en/690/',
  },

  // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
  // field definitions. The result will be used to augment the sample.
  // outputFields: () => { return []; }
  // Alternatively, a static field definition should be provided, to specify labels for the fields
  outputFields: outputFields(),
};
