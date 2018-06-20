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
    label: 'Push/Update Url Content',
    description: 'Push/Update content to a specified push source with a url.'
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
        helpText: 'The main URL to your document or page you wish to push.'
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
        key: 'data',
        required: false,
        type: 'string',
        label: 'Submission Description',
        helpText: 'Description of the purpose of the submission (i.e. Adding missing file).'
      },
      {
	key: 'thumbnail',
	required: false,
	type: 'string',
	label: 'Thumbnail',
	helpText: 'Thumbnail to go with the main url supplied.'
      },
      {
	key: 'download',
	required: false,
	type: 'string',
	label: 'Download link',
	helpText: 'Download links of the file if they exist.'
      },
      {
	key: 'content',
	required: false,
	type: 'string',
	label: 'Additional Content',
	helpText: 'The content of the file in plain text.' 
      }
    ],
    //Action function
    perform: (z, bundle) => {
	let compressed = ""
      if (bundle.inputData.download) {
        compressed = base64.encode(pako.deflate(bundle.inputData.download, { to: 'string' }));
      }	
      const promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'PUT',
        body: JSON.stringify({
	 documentId: bundle.inputData.docId,
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data,
	 thumbnail: bundle.inputData.thumbnail,
	 description: bundle.inputData.description,
	 documentdownload: bundle.inputData.download,	  	 	  
	}),
	params:{
	 documentId: encodeURI(bundle.inputData.docId),
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data,
	 thumbnail: bundle.inputData.thumbnail,
	 description: bundle.inputData.description,
	 documentdownload: bundle.inputData.download,
	},
        headers: {
          'Content-Type': 'application/json',
	  'Accept': 'application/json',
        }
      });

      return promise.then(response => { 
 
	if(response.status >= 400){

		throw new z.errors.HaltedError('Error occured. Multiple possible reasons (note: more than one can occur at a time): incorrect token/API key, incorrect sourceId/orgID/Platform, or a timeout.\nPlease check the following and try again. Specific error message: ' + z.JSON.parse(response.content).message);

	}

	return {Document: `${bundle.inputData.docId}`,
		Title: `${bundle.inputData.title}`,
		Content: `${bundle.inputData.content}`,
		Purpose: `${bundle.inputData.data}`};

     });
         
    },

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: {
   	docId: 'file://folder/my-file.html',
	sourceId: 'rp5rxzbdz753uhndklv2ztkfgy-mycoveocloudv2organizationg8tp8wu3',
	orgId: 'mycoveocloudv2organizationg8tp8wu3',
	platform: 'push.cloud.coveo.com',
	title: 'my-file.html',
	data: 'Adding test file to push source.',
	download: '<download link here (pdf or other)>',
	additional: '<other links relating to main pushed file here>',
	content: 'Note: to be included in search api page implementation later for more testing.',
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
