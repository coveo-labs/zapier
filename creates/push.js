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
    label: 'Push/Update Content in a Push Source',
    description: 'Push/Update content to a specified push source with a document url.'
  },

  // `operation` is where the business logic goes.
  operation: {
    //App template input
    inputFields: [
      {
        key: 'docId',
        required: true,
        type: 'string',
        label: 'Document ID',
        helpText: 'The main URL to your document or page you wish to push.'
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
	label: 'Source ID',
        helpText: 'The ID of the source in the Coveo Cloud V2 Organization you wish to push to.'
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        helpText: 'The ID of the organization where your source is located.'
      },
      {
        key: 'platform',
        required: true,
	label: 'Platform',
        choices: { 'pushdev.cloud.coveo.com': 'Dev', 'pushqa.cloud.coveo.com': 'QA', 'push.cloud.coveo.com': 'Prod' },
        helpText: 'The platform in which your organization lives.'
      },
      {
	key: 'title',
	required: true,
	type: 'string',
	label: 'Title of Submission',
	helpText: 'The title to be displayed within the content browser.'
      },
      {
        key: 'data',
        required: false,
        type: 'string',
        label: 'Submission Description',
        helpText: 'Description of the purpose of the submission (i.e. subject of an email would go here).'
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
	label: 'Content',
	helpText: 'The content of the file in plain text.' 
      }
    ],
    //Action function
    perform: (z, bundle) => {	
      const promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'PUT',
        body: JSON.stringify({
	 documentId: bundle.inputData.docId,
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data,
	 thumbnail: bundle.inputData.thumbnail,
	 documentdownload: bundle.inputData.download,	  	 	  
	}),
	params:{
	 documentId: encodeURI(bundle.inputData.docId),
	 title: bundle.inputData.title,
	 content: bundle.inputData.content,
	 Data: bundle.inputData.data,
	 thumbnail: bundle.inputData.thumbnail,
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
		Organization: `${bundle.inputData.orgId}`,
		Source: `${bundle.inputData.sourceId}`,
		Platform: `${bundle.inputData.platform}`,
		Title: `${bundle.inputData.title}`,
		Content: `${bundle.inputData.content}`,
		Purpose: `${bundle.inputData.data}`,
		Downloads: `${bundle.inputData.download}`,
		};

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
