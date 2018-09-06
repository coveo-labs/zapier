/* globals it */
const should = require('should');

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
const cleanResult = require('../../resources/queryHandler').cleanResult;

describe('searches', function() {
  before(function() {
    // This must be included in any test file before bundle, as it extracts the authentication data that was exported from the command line.
    // Put test ACCESS_TOKEN in a .env file.
    // The inject method will load them and make them available to use in tests.
    zapier.tools.env.inject();
    should.ok(process.env.TEST_ORG_ID, 'missing TEST_ORG_ID=some-id in .env');
    should.ok(process.env.ACCESS_TOKEN, 'missing ACCESS_TOKEN. Add ACCESS_TOKEN=some-token in .env');
  });

  it('Search a Specified Org Test', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        lq: 'Use Push API',
        organizationId: process.env.TEST_ORG_ID,
      },
    };

    return appTester(App.searches.orgQuery.operation.perform, bundle);
  });

  it('Search Coveo Public Docs Test', function() {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {
        lq: 'What is Coveo for Sitecore?',
      },
    };

    // Searching the public org requires SEARCH_TOKEN to be set in .env
    should.ok(process.env.SEARCH_TOKEN, 'missing SEARCH_TOKEN. Add SEARCH_TOKEN=some-token in .env');

    return appTester(App.searches.publicQuery.operation.perform, bundle);
  });

  it('Clean Result 1', function() {
    let res1 = cleanResult({ id: 'item://1', title: 'Blah', Title: 'Blah', systitle: 'Blah' });
    should.equal(JSON.stringify(res1), `{"id":"item://1","title":"Blah"}`);
  });

  it('Clean Result 2', function() {
    let res1 = cleanResult({ id: 'item://1', title: 'Blah', raw: { Title: 'Blah', systitle: 'Blah', title: 'Blah' } });
    should.equal(JSON.stringify(res1), `{"id":"item://1","raw":{"title":"Blah"},"title":"Blah"}`);
  });

  it('Clean Result 3', function() {
    let res1 = {
      title: `What's New - For Coveo Platform Administrators - Coveo Platform 7 - Online Help`,
      uri: 'localtest://12345/file2',
      printableUri: 'localtest://12345/file2',
      clickUri: 'localtest://12345/',
      uniqueId: '42.53734$localtest://12345/file2',
      excerpt:
        'December 2016 ... June 2016 ... March 2016 ... Note: You can also refer to the new features visible to end-users and the new ... March 2018 ... The SharePoint connector now supports instances using Okta as a single sign-on ... You can therefore configure your SharePoint source and security providers to ... [more] ... September 2017 ... The Jira and Lithium connectors now support incremental refresh. ... The connectors therefore periodically query Jira and Lithium for the latest item ...',
      firstSentences: `Community Product DocsMenu Support Product Docs Developer Docs Answers Training More Coveo Cloud V1 Administration Console Coveo Cloud V2 Administration Console Technical Blog Coveo Cloud Coveo Platform 7.0 Coveo Platform 6.5 FR Administrator Help What's New Release Notes Hardware and Software Requirements Deployment Coveo Enterprise Search 7.0 Coveo REST Search API 8.0 Coveo JavaScript Search Interface Coveo .NET Front-End 12.0 Coveo for Sitecore Connectors Third-Party System Procedures`,
      summary: null,
      flags: 'IsAttachment;HasHtmlVersion;SkipSentencesScoring',
      hasHtmlVersion: true,
      hasMobileHtmlVersion: false,
      score: 1446,
      percentScore: 85.56588,
      rankingInfo: null,
      rating: 3.0,
      isTopResult: false,
      isRecommendation: false,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      parentResult: null,
      childResults: [],
      totalNumberOfChildResults: 0,
      absentTerms: [],
      raw: {
        systitle: `What's New - For Coveo Platform Administrators - Coveo Platform 7 - Online Help`,
        systopparent: '36',
        sysauthor: 'Coveo Doc Team',
        sysurihash: 'NPLAPNBta7UFYðfe',
        urihash: 'NPLAPNBta7UFYðfe',
        sysuri: 'localtest://12345/file2',
        systransactionid: 2845,
        topparentid: 36,
        sysconcepts:
          'Diagnostic Tool ; Coveo connector ; new features ; on-premises setup ; SharePoint ; NET Front-End ; future release ; efficiently access ; troubleshooting process ; performances ; redirections ; integration ; customizations',
        attachmentparentid: 36,
        concepts:
          'Diagnostic Tool ; Coveo connector ; new features ; on-premises setup ; SharePoint ; NET Front-End ; future release ; efficiently access ; troubleshooting process ; performances ; redirections ; integration ; customizations',
        isattachment: '36',
        sysindexeddate: 1535639323000,
        syslanguage: ['English'],
        transactionid: 2845,
        title: `What's New - For Coveo Platform Administrators - Coveo Platform 7 - Online Help`,
        date: 1535639323000,
        syssite: 'https://coveo.com/',
        rowid: 7501,
        sysisattachment: '36',
        site: 'https://coveo.com/',
        sysattachmentparentid: 36,
        size: 58673,
        clickableuri: 'localtest://12345',
        syssource: 'user1@gmail.com test source',
        orderingid: 1535639322179,
        syssize: 58673,
        sysdate: 1535639323000,
        topparent: '36',
        author: 'Coveo Doc Team',
        systopparentid: 36,
        source: 'user1@gmail.com test source',
        collection: 'default',
        indexeddate: 1535639323000,
        filetype: 'html',
        sysclickableuri: 'localtest://12345',
        sysfiletype: 'html',
        language: ['English'],
        sysrowid: 7501,
        uri: 'localtest://12345/file2',
        syscollection: 'default',
      },
      Title: `What's New - For Coveo Platform Administrators - Coveo Platform 7 - Online Help`,
      Uri: 'localtest://12345/file2',
      PrintableUri: 'localtest://12345/file2',
      ClickUri: 'localtest://12345/',
      UniqueId: '42.53734$localtest://12345/file2',
      Excerpt:
        'December 2016 ... June 2016 ... March 2016 ... Note: You can also refer to the new features visible to end-users and the new ... March 2018 ... The SharePoint connector now supports instances using Okta as a single sign-on ... You can therefore configure your SharePoint source and security providers to ... [more] ... September 2017 ... The Jira and Lithium connectors now support incremental refresh. ... The connectors therefore periodically query Jira and Lithium for the latest item ...',
      FirstSentences: `Community Product DocsMenu Support Product Docs Developer Docs Answers Training More Coveo Cloud V1 Administration Console Coveo Cloud V2 Administration Console Technical Blog Coveo Cloud Coveo Platform 7.0 Coveo Platform 6.5 FR Administrator Help What's New Release Notes Hardware and Software Requirements Deployment Coveo Enterprise Search 7.0 Coveo REST Search API 8.0 Coveo JavaScript Search Interface Coveo .NET Front-End 12.0 Coveo for Sitecore Connectors Third-Party System Procedures`,
    };

    let clean1 = cleanResult(res1);

    should.ok(res1.excerpt);
    should.ok(res1.Excerpt);
    should.ok(res1.title);
    should.ok(res1.Title);
    should.ok(res1.raw.source);
    should.ok(res1.raw.syssource);
    should.ok(res1.raw.title);
    should.ok(res1.raw.systitle);

    should.ok(clean1.excerpt);
    should.not.exist(clean1.Excerpt);
    should.ok(clean1.title);
    should.not.exist(clean1.Title);

    should.ok(clean1.raw.source);
    should.not.exist(clean1.raw.syssource);
    should.ok(clean1.raw.title);
    should.not.exist(clean1.raw.systitle);

    should.not.exist(clean1.excerptHighlights);
    should.not.exist(clean1.summary);

    should.equal(clean1.raw.author, 'Coveo Doc Team');
  });
});
