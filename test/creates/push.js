require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('Zip Testing', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1WfgmexkYFFZfDCt6s5P64IyxvnKeAp4-/preview?usp=drivesdk',
        title: 'Zip Testing',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kEFrgzAYhv9LDj3VakyMRiijbBTGYOw2toto8qmpmtgk2nal_30Ku-47ve_Dw3d470hp50stoFAS5YQnHLMk2aJaQS8LXQ6A8qX0gLZItCC6ooMbyjGLk5iShRntQfvC38bVfF-07lLaxqH8jibbL6z1fnR5GEojgkgELAqW5HaNMU0PkwP792MnzLBKLnQgJgtOhKpzEJ-mE42ANSOMfEyrnnDZ1XA2Vs-hNWPVkcqQKZ1VbOYq9oNLxayY1GeZTSFOCE4pZ9F6ISaMUJrFhCY84xHmWcr-gZ91M8C1-zoev-uXZ89c8sHo6-066zc4jDR4aveYYoZTFnOWsTgilFGabGAvzUX3ppSbRu69ndblamOH0i9b_KhxqV75fl3rYEWrZtit9PH4BaqCfMQ:1ff5W9:0jUqSbCGYC96LeRfqVzKfWA8XFI/',
        field1: 'thumbnail',
        data: 'This should be in the content of the submission',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
        field3: 'downloadlink',
        field3Content: 'download link test',
        sourceId,
        orgId,
      },
    };

    appTester(App.creates.push.operation.perform, bundle)
      .then((result) => {
        console.log(result);
        done();
      })
      .catch(done);
  });

});
