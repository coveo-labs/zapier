const base64 = require('base-64');

const getAccessToken = (z, bundle) => {
	const promise = z.request(`https://platformdev.cloud.coveo.com/oauth/token#`, {
		method: 'POST',
		body: {
			code: bundle.inputData.code,
			grant_type: 'authorization_code',
			redirect_uri: bundle.inputData.redirect_uri
		},
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${base64.encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)}`
		}
	});

	// Needs to return at minimum, `access_token`, and if your app also does refresh, then `refresh_token` too
	return promise.then((response) => {
		if (response.status !== 200) {
			throw new Error('Unable to fetch access token: ' + z.JSON.stringify(response.content));
		}

		const result = JSON.parse(response.content);
		return {
			access_token: result.access_token,
			refresh_token: result.refresh_token
		};
	});
};

const testAuth = (z, bundle) => {
	// Normally you want to make a request to an endpoint that is either specifically designed to test auth, or one that
	// every user will have access to, such as an account or profile endpoint like /me.
	const promise = z.request({
		url: `https://platformdev.cloud.coveo.com/rest/templates/apikeys`,
	});

	// This method can return any truthy value to indicate the credentials are valid.
	// Raise an error to show
	return promise.then((response) => {
		if (response.status !== 200) {
			throw new Error('The access token you supplied is not valid');
		}
		return response;
	});
};

module.exports = {
	type: 'oauth2',
	oauth2Config: {
		// Step 1 of the OAuth flow; specify where to send the user to authenticate with your API.
		// Zapier generates the state and redirect_uri, you are responsible for providing the rest.
		// Note: can also be a function that returns a string
		authorizeUrl: {
			url: 'https://platformdev.cloud.coveo.com/oauth/authorize',
			params: {
				client_id: '{{process.env.CLIENT_ID}}',
				redirect_uri: '{{bundle.inputData.redirect_uri}}',
				response_type: 'code',
				realm: 'Platform',
				scope: 'full'
			}
		},
		// Step 2 of the OAuth flow; Exchange a code for an access token.
		// This could also use the request shorthand.
		getAccessToken: getAccessToken

		// If there is a specific scope you want to limit your Zapier app to, you can define it here.
		// Will get passed along to the authorizeUrl
		// scope: 'read,write'
	},
	// The test method allows Zapier to verify that the access token is valid. We'll execute this
	// method after the OAuth flow is complete to ensure everything is setup properly.
	test: testAuth,

	connectionLabel: '{{username}}'
};
