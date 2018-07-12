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
        docId: 'https://mail.google.com/mail/u/0/#inbox/1648f45147d95c19',
        title: 'Zapier Zip Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJxNkduOqkAQRX9l0s_DiSi04JugIspNRVQmJ6S5CA1CtzYoaPz34Vwe5rVq7V1JrRfAFatRFSUBjsFkJIsyD0XxE5xxcomDCpUJmABU1yjKyqSqGfgEUZZERVAkHZjwcCgOhVE_I1Xdr4O6o38CVo8VD3RLGZi8QJkwhtJ_FwAPBeksiLwwjmUx4uWe_Fk_-XqBv9zU0vJ4xWn1HAkDiTCvyaa67c6uakSMUi-nZjEO2fy5PqZsH2fLLd50bMDtqJR5GzMc5wuSaobsBs5UfWS0DjivkSsXK6u1bjVYjNYI8jeDOJxChOBmz86RoHLexbyaW9rmnurGywPJ666x1OfhhDXF4ff-GDaNHJpHf354rjzG66bC5zObFhxCO1nqnHy7R8Olqz_NeIlZ1ZYaZ-DVjp6D-zkK8jK1Kx91aWBvaQN3j4N9aE8hfIRaPEK8b7bhDpXEltsMyujIpRTuDXsuXRSntfwko-uhZFnlwKO5Qg3k3BeScYXiZu46o5OzoCO4Fx0Ebbvo3_pfnkruCfnwEcXJ7UPvNaU3VGNS_YpJ1IL37_f7G034q7Y:1fdeE8:PaBhgIEUh8yuOMJIiMLlXlHMIlw/',
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
