'use strict';

const platform = require('../config').PLATFORM;
const { handleError, coveoErrorHandler } = require('../utils');

//This functions handles the query call to Coveo, then
//sends off the result to the output handler.
const handleQuery = (z, bundle) => {

  let tempKey = '';

  //Default to help documents org if needed and for
  //publicQuery action. Don't change access_token of bundle,
  //just use a tempKey to avoid errors in swapping access_tokens.
  if(!bundle.inputData.organizationId ){
    bundle.inputData.organizationId = 'coveosearch';
    tempKey = process.env.SEARCH_TOKEN;
  } else {
    tempKey = bundle.authData.access_token;
  }

  //Construct query call to Coveo
  const orgQueryPromise = z.request({
    url: `https://${platform}/rest/search/v2/`,
    method: 'GET',
    params: bundle.inputData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + tempKey,     
    },
  });

  //Handle response info
  return orgQueryPromise.then((response) => {

    //Handle errors that can occur
    if(response.status !== 200){
      coveoErrorHandler(response.status);
    }

    //Get the important parts of the response that we want
    let results = z.JSON.parse(response.content).results;

    //Send to output handler
    return queryOutput(bundle, results);
  })
    .catch(handleError);

};

//This function handles the output te user will see on Zapier.
//Only extract the important components of each document the was fetched
//for the user, like title and url.
const queryOutput = (bundle, results) => {
  const documents = {};
  //give the user plain text an html of all the document information, so they don't have 
  //to use so many inputs to get it all.
  let html = `<html><head><title>Results For The "${bundle.inputData.lq}" Query</title></head><body>`;
  let text = `Results for the "${bundle.inputData.lq}" query:\n\n`;
  const docs = [];

  //If no results were found, nothing matched the query.
  if(!results.length){

    //Tell the user no documents found, give them the
    //input the gave, then return.
    documents['No Documents Found'] = 'No documents matching your query were found';
    Object.assign(documents, bundle.inputData);
    docs.push(documents);
    return docs;
  }

  //For each item that was returned
  results.forEach((item, i) => {
    let docInfoHTML = '';
    let docInfoTXT = '';

    //Sort through the keys of each item object in the returned array response
    Object.keys(item).forEach(key => {

      //These are the really only good keys returned that the user may find useful for their output on Zapier.
      //Filter out the others and save these. Number them to differentiate them on Zapier.
      if(key === 'Title' || key === 'ClickUri' || key === 'Excerpt'){
        if(key === 'ClickUri'){
          let tempKey = 'Url';
          documents['Document #' + (i + 1) + ' Url'] = item[key];
          docInfoHTML += `<div>${tempKey}: ${item[key].link(item[key])}</div>`;
          docInfoTXT += `${tempKey}: ${item[key]}\n`;
        } else {
          documents['Document #' + (i + 1) + ' ' + key] = item[key];
          docInfoHTML += `<div>${key}: ${item[key]}</div>`;
          docInfoTXT += `${key}: ${item[key]}\n`;
        }
      }
    });

    text += '\nDocument #' + (i + 1) + ':\n' + docInfoTXT;
    text += '\n';
    html += '\nDocument #' + (i + 1) + ':\n' + docInfoHTML;
    html += '<br></br>\n';
  });

  //Assign what the user input, save the desired values from the response then return
  html += '</body></html>';
  documents['Documents HTML'] = html;
  documents['Documents Text'] = text;
  Object.assign(documents, bundle.inputData);

  docs.push(documents);
  console.log(docs);
  return docs;
};

module.exports = {
  handleQuery,
};