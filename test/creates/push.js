require('should');

const orgId = 'bryanarnoldzapier9xh3mbas';
const sourceId = 'qewkgvadvtzzr5ciycjoyhkf54-bryanarnoldzapier9xh3mbas';
const platform = 'pushdev.cloud.coveo.com';

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
        docId: 'https://drive.google.com/a/uconn.edu/file/d/1CVhqP7vOyW1rpqvbI2yEbzMVIwnp5M4-/preview?usp=drivesdk',
        title: 'Zapier Single Item Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJx1kD1v2zAQhv-KwSFTbJHih0QBRoa2Q4CmzVAko0GLZ0oRRdIkJUMJ8t8rAVlz070P3rvh-UC9S1m5Fk69Rg2VXBLB-T269GD1yakRULMGC-getR20w2mABTVElLxkdGXeZXD5lJewNf-steGmokmo-UBTtCvrcg6pKQrt2z2u9wLv1y0djPfGwpQgfv04tH7cSqlI0E4RUlv0Q4LybXpjGIQJEGSozpZKPVzg6qObCxGdjr20ScV65DOu-gBDZXDiV0o5nQvCKZb4awpCBWWsLinjspaYyLoS38AfL931uZr_Lq8khut8fiyXX-f3p5fHmwv8ie0fuiNhRJBKlFLUosSUCcb4HRy1vznrlb4z-pjjtJm7-DiqvLoI-rLG3Ge72fqtnJmUgd1PmMH6MK4Wdsrp3T9oO-etN8thu_j8_A_SMYYE:1fbWig:_M7wgqzNYx77WV6CQaC5BkonLZk/',
        field1: 'thumbnail',
        field1Content: 'testing thumbnail',
        field2: 'additionalcontent',
        field2Content: 'testing additional content',
        sourceId,
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
