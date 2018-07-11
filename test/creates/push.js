require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('Single Item Push', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1Nk_Y7HLRJLXu7mQNJRzJNXa0nP3zyi0h/preview?usp=drivesdk',
        title: 'Zapier Zip Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kEFv4yAQhf9KxKGnJgaDsbEU7WUPqyiKdqseuieL4gl2wOAFnCqp-t-LV712TvOe3oyevnc0upikU9CNPWqpqAThVfWIziPYvnNyAtRmYQE9IjWAMp2BG2oJL6uS0ex5l8ClLt3mNXnKMfMmg46ofUdLsNkbUppjWxS9V1ustxxv8xZ32nttYYkQvn7slJ_WUCwiqCVAVMVoIpSX5cIwcD3DLOb61VLRmzP888FdC8_5hWBzzb1VsDio13gRpjFNUiZGTQpSUUJpif9PQSinjDUlZZVoBCaiqfk35sl0f-tfx6fD8WWppz-nw9P9cHqR2P2m99uIhx_DnjDCSc1LwRteYso4Y9UD7Hv_5qyX_YPu9yksK7mzD5NMmcV9nLNMY7IrraN0epEaNj_hCtbPU6awka7fPIManLde33brxcfHJ-Ayhhk:1fdK9j:Oyy4G4v10pNbNCSE1fkwZgR7CUA/',
        field1: 'thumbnail',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
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
