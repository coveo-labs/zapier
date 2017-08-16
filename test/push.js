require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

`
 {key: 'url', required: true, type: 'string'},
      {key: 'sourceId', required: true, type: 'string'},
      {key: 'orgId', required: true, type: 'string'},
      {key: 'apiKey', required: true, type: 'string'},
      {key: 'platform', required: true, choices: {dev: 'pushdev.cloud.coveo.com', qa: 'pushqa.cloud.coveo.com', prod: 'push.cloud.coveo.com'}}
`

describe('pushes', () => {

  describe('push content', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          docId: 'https://www.youtube.com/watch?v=Y3gC7NizMd4',
          text: 'some text',
          sourceId: 'syxjf4ckgric4ndrcd6dpaslum-myorgsarecursed',
          orgId: 'myorgsarecursed',
          apiKey: 'xx341750b0-f929-4390-b4ed-f99060810e7f',
          platform: 'pushdev.cloud.coveo.com'
        }
      };

      appTester(App.creates.push.operation.perform, bundle)
        .then((result) => {
          console.log(result);
          done();
        })
        .catch(done);
    });
  });
});
