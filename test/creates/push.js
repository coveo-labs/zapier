require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';
const platform = 'pushdev.cloud.coveo.com';

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('pushes', () => {

  it('CMD', (done) => {
    zapier.tools.env.inject();
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1a99nRwp6qsmciQB88ZwSp84kmiGVuzCE/preview?usp=drivesdk',
        title: 'sample.dmg',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kEtPwzAQhP-LDz3Rxo4fsSNVSCDEDQmQOHCp0niTOC-7sU1oq_53EsSVPe18O1pp5orM6EMxlnAwGuVUcUUE53eoMtDrw1gMgPJF9IDuUNlA2R06OKOciJSnjC7MjgHGcAhntzpfFls3F1PtUX5FceoX1oTgfJ4k2pZbjLcCb5fN72pr6x6ih-nvx660w2ryiYcyTuDLxHQe0ja2DIOoHTjlsmNPle4qONlp_Ep4q5s0EtmamPG2IoNTnXQ6QuOHhh6bhHCKZYolXichVFDGZEoZV1JhomQm_oGFUuPb7MTJD6V5fZDyc353knWDef6Il8en-2ZPGBEkE6kSUqSYMsEY38Be23nsbaE3td6HKa7NVXYairB0scT7XnQwoV_rOtvYmw7a4nLZ_Z5utx_1rX7T:1fbARd:26UZ5vHXFoTsa2TAQf88wMM3ZuM/',
        sourceId,
        additional: 'testing additional content',
        orgId,
        platform,
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
