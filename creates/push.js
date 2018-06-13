const base64 = require('base-64');
const pako = require('pako');

// We recommend writing your creates separate like this and rolling them
// into the App definition at the end.
module.exports = {
  key: 'push',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Push',
  display: {
    label: 'Push',
    description: 'Push content to Push Source.'
  },

  // `operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document Url',
        helpText: 'The URL to your document, if applicable.'
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID in the Coveo Cloud V2 Organization you wish to push to.'
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'The Cloud V2 Organization ID where your source is located.'
      },
      {
        key: 'platform',
        required: true,
        choices: { 'pushdev.cloud.coveo.com': 'dev', 'pushqa.cloud.coveo.com': 'qa', 'push.cloud.coveo.com': 'prod' },
        helpText: 'The platform in which your organization lives.'
      },
      {
	key: 'title',
	required: true,
	type: 'string',
	helpText: 'Title of submission.'
      },
      {
	key: 'content',
	required: true,
	type: 'string',
	label: 'File Content',
	helpText: 'Any content you wish to include about the pushed file. Can be description of the file, additional urls to access, etc..' 
      },
      {
	key: 'data',
	required: false,
	type: 'string',
	label: 'Submission Description',
	helpText: 'Description of the purpose of the submission (i.e. Adding new file).'
      }
    ],
    //Action function
    perform: (z, bundle) => {
      let apiKey = "xxb8c53956-b063-4504-8a3b-805359fc1d0e"
      const promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'PUT',
        body: JSON.stringify({
	 documentId: bundle.inputData.docId,
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data, 	 	  
	}),
	params:{
	 documentId: encodeURI(bundle.inputData.docId),
	 title: bundle.inputData.title,
	 content: encodeURI(bundle.inputData.content),
	 Data: bundle.inputData.data
	},
        headers: {
          'Content-Type': 'application/json',
	  'Accept': 'application/json',
	  'Authorization': `Bearer ${apiKey}`
        }
      });

      return promise;
         
    },

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: {
   	docId: 'https://www.coveo.com/en',
	sourceId: 'YOUR SOURCE ID',
	orgId: 'YOUR ORGANIZATION ID',
	platform: 'push.cloud.coveo.com',
	title: 'Evernote Schedule',
	content: 'PDF of file...',
	data: 'Adding missing files from project'	   
    },

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: [
	{key: 'docId', label: 'Document Url'},
	{key: 'title', label: 'File Title'},
	{key: 'content', label: 'Additional content about the file pushed'},
	{key: 'data', label: 'Description of purpose of the pushed file'}

    ]
  }
};
