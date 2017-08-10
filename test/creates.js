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

describe('creates', () => {

  describe('create push create', () => {
    it('should push some text', (done) => {
      const bundle = {
        inputData: {
          url: 'https://www.youtube.com/watch?v=Y3gC7NizMd4',
          sourceId: 'xwxuywk76hes5gq2y65gh5cjdi-myorgsarecursed',
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
