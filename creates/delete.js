const deleteResource = require('../resources/delete');
const generateResponse = require('../resources/responseContent');
const completeBody = generateResponse.completeBody;
const completeParams = generateResponse.completeParams;

module.exports = {
  key: 'deletes',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'Delete',
  display: {
    label: 'Delete Item From Source',
    description: 'Delete content from a specified push source.',
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
        helpText: 'The ID of the document you wish to delete, the url provided when indexing.',
      },
      {
        key: 'sourceId',
        required: true,
        type: 'string',
        label: 'Source ID',
        helpText: 'The ID of the source inside of your organization.',
      },
      {
        key: 'orgId',
        required: true,
        type: 'string',
        label: 'Organization ID',
        helpText: 'The ID of the organization within your platform.',
      },
      {
        key: 'platform',
        required: true,
        label: 'Platform',
        choices: {'pushdev.cloud.coveo.com': 'Dev', 'pushqa.cloud.coveo.com': 'QA', 'push.cloud.coveo.com': 'Prod' },
        helpText: 'The platform in which your organization lives.',
      },
    ],
    //Action function
    perform: (z, bundle) => {	
      const promise = z.request({
        url: `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/sources/${bundle.inputData.sourceId}/documents`,
        method: 'DELETE',
        body: JSON.stringify(completeBody(bundle)),
        params:completeParams(bundle),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      return promise.then(response => { 
 
        if(response.status >= 400){
          throw new z.errors.HaltedError('Error occured. Multiple possible reasons (note: more than one can occur at a time): incorrect token/API key, incorrect sourceId/orgID/Platform, or a timeout.\nPlease check the following and try again. Specific error message: ' + z.JSON.parse(response.content).message);
        }

        return {Document: `${bundle.inputData.docId}`,
          Source: `${bundle.inputData.sourceId}`,
          Organization: `${bundle.inputData.orgId}`,
          Platform: `${bundle.inputData.platform}`,
        };

      });
         
    },

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: deleteResource.sample,

    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    //    outputFields: deleteResource.outputFields,
  },
};
