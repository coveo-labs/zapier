const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

// Tests for pushing a document in a push source. Change the inputData to match the credentials
// of the source you're testing.

describe('pushes', function() {
  before(function() {
    // This must be included in any test file before bundle, as it extracts the
    // authentication data that was exported from the command line.
    zapier.tools.env.inject();

    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.TEST_SOURCE_ID, 'missing TEST_SOURCE_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Push Test', function() {
    this.timeout(10000); // set timeout to 10 seconds
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      // Change this content to match your source and what you want to push when testing
      inputData: {
        documentId: 'https://mail.google.com/mail/u/0/#inbox/164ec6138597a473',
        title: 'Push Test',
        content: 'https://zapier.com/engine/hydrate/1625243/.eJxVktmyokgQQH_lBs-XDmQv31AUBEQUBbWjg2ApNqGKpVj0xv33sWcmYqZfM09mRp7ML6pAPQlRDIMioZY8swAMw7KfVFrAKglQWENqSYWEhHFeQ0R66pOKcxg_ggd8UsuFyAosz71jGJF3OiDP5neB_cYeU9hlPbX8omrY92H2zwRqIfIwFhecLAAp5CXuTf6__fLnF_U3p9hamRj0OtejbcyZal9recnpmx1Bxyg0XuAhkRO_qC_84VVf2tuJuTkRMGdgihhMV4O4s2PxXlzWyJ1mrzRmcc-0Pm5xpsMRbLA8-Xvuok7PqBHHVWrrMpEdD2WqsUutcY8b0MjR8WzDdL6vtfFKh04O_dK6r8nTOvLhlr67XReccdIEL0dMFXVFa8nm5XRDbChRatRChtoKPNOhSK6GPhXrg_mUjcI_E7PoNWfFxVnYDs422e2OnfIS7jvH7l16f9DXUGLlLdjw6pgFqwd_G2LMCkHb6Vei0Fc_n6orUK-pZgGDJOeu2tszKJg21mfX5AXvdXxr_fd4Voiy4a3_Q4UjrHDz2_NHiJKPM4xzhCucPX80DZmp788_1AOHj9jE9pisaCyuvuXcky3fi1lCz0LBGfBd38MLGSbFEKVEQwccM6Nz0Ln41d3OGNGa5AD6vDq_7CyvWwclpwnV_oNPJ8kMxIDZyF685oG2D1ZFMdwPYX1cINvpYZRPfCNbo4YrRTvJluLd1PI5glyn42rlVmoEdiU9Ab-etC5BxB5b0LBCutre5AS4fdjfio1lhhs2GYo59U2C59ryMumuNNvYVnLpkdNjZNxbSabddpEsTsmpFdSTGd-2fH64LNLwOIl9BNmA3gw5R0g10lDWBElKAr_PNO18cnOz3BSev8O0Z413xPixhMsTcfn_1EdhssZ1073_v8CI-v71_f0XeHMmwQ:1fkCbg:irnlkwbYMYRB7R6_NPZc1oL2KHQ/',
        field1: 'thumbnail',
        data: '<html><p>Why no work</p></html>',
        field1Content: 'testing thumbnail field',
        field2: 'additionalcontent',
        field2Content: 'testing additional content field',
        field3: 'downloadlink',
        field3Content: 'download link test',
        orgId: process.env.TEST_ORG_ID,
        sourceId: process.env.TEST_SOURCE_ID,
      },
    };

    return appTester(App.creates.push.operation.perform, bundle);
  });
});
