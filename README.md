# Coveo Zapier Integration

This is the code for the integration of the Coveo app on Zapier. It is capable of extracting the content of files or urls, then indexing that content into a specified push source on the Coveo Cloud Platform as either a single item push, or a batch. It also allows for documents to be searched for in an organization, or for public help documents regarding Coveo.

The Coveo Zapier integration is now available [directly in Zapier](https://zapier.com/apps/coveo/integrations).

## Setting Up The App

Before starting anything Zapier related, it will probably be helpful to brush up on some of Coveo's API.
Head [here](https://platform.cloud.coveo.com/docs?api=Platform) for a refresher or to get antiquated with Coveo API, as many different calls using the API are used within this project.

It's recommended to use the latest LTS version of [Node.js](https://nodejs.org/en/download/).

For general information regarding Zapier, you can review [Zapier's main documentation page](https://zapier.com/developer/documentation/v2/). We are also using [Zapier Platform CLI](https://zapier.github.io/zapier-platform-cli/cli.html), available from [npm](https://www.npmjs.com/package/zapier-platform-cli).
The main zapier [Github](https://github.com/zapier/zapier-platform-cli) also has a very good description of all the components of the CLI as well as example apps you can look at.

In order to get a better grasp of the requirements for the CLI as well as how it functions, follow the first section, the setup portion, of this [tutorial](https://zapier.com/developer/start/introduction).
You can follow the entire tutorial if you wish, but do not clone the Coveo app if you do, clone their example app instead.

Note: you will need your own Zapier account in order to login from the command line in the `Run Zapier Login` step in the tutorial.

Once you have completed the set up and logged in, you'll want to clone the Coveo app, move into the directory where the app code was stored, and install it's components:

```bash
git clone https://github.com/coveo-labs/zapier.git
cd zapier
npm install
```
Now, you should have the app and all of it's dependencies installed in the directory. If the app failed to update or fully install on it's own, run the following command to ensure the app is updated:

```bash
sudo npm install -g zapier-platform-cli
```
The basics of setting up the app should be complete at this point. If any problems arose, diagnose them from the errors in the command line and resolve them. Note: you may have to run `sudo npm install -g zapier-platform-core` as well if you get an error while testing.

Now, you'll want to register your own app on the website. Run the following commands in order to do so:

```bash
zapier register "app-name"
zapier push
```
`zapier register` registers your app on the Zapier website, and `zapier push` pushes the contents of the app onto the site where your app is. You can use the `zapier apps` command at anytime to see the apps you have registered with your account.

After these two commands are done, you'll be able to configure your newly created app to work with Coveo. DO NOT input the `zapier init .` command unless you want to completely erase the Coveo app content. Only do this when you're starting an app completely from scratch. If you wish to change the app in which your directory is linked to, you can run `zapier link` to get a list of apps you can link your current directory to.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Adding in the Coveo App's Specific Information

Now you'll have to update any information that is specific to the Coveo App. First, navigate to the `config.json` file. You should find the following inside:

```json
{
 "PLATFORM": "platform.cloud.coveo.com",
 "PUSH": "push.cloud.coveo.com",
 "REDIRECT_URI": "https://zapier.com/dashboard/auth/oauth/return/App-IDCLIAPI/"
}
```

Now, you will need to replace the `REDIRECT_URI` with the correct one. Run `zapier describe` on the command line to get the correct `REDIRECT_URI`.
It will be located in the `Authentication` section of the output. Copy paste the url into the `REDIRECT_URI`
in `config.json`. Note: you must have a registered app on Zapier and have pushed it at least once to get the `REDIRECT_URI`. The following should be the final content of `config.json`:

```json
{
 "PLATFORM": "platform.cloud.coveo.com",
 "PUSH": "push.cloud.coveo.com",
 "REDIRECT_URI": "https://zapier.com/dashboard/auth/oauth/return/AppID#CLIAPI/"
}
```

Finally, you'll want to tell Zapier what `CLIENT_ID` and `CLIENT_SECRET` to use when authenticating with Coveo. You will also need the version number of the app as well as a `SEARCH_TOKEN` to be able to use the `Find help Documents` of the Coveo app. You can get the app version by running `zapier versions` on the command line. Get these client credentials, versions number, and the token, then enter the following commands:

```bash
zapier env <coveo-app-version> CLIENT_ID <coveo-client-id>
zapier env <coveo-app-version> CLIENT_SECRET <coveo-client-secret>
zapier env <coveo-app-version> SEARCH_TOKEN <coveo-search-token>
```

To ensure the environment was setup correctly, run `zapier env <coveo-app-version>`. If the credentials match up, you've finished setting up the app.
You should now set up a `.env` file to store these credentials and prep for testing. This isn't required, but it is very helpful for Zapier and let's you have access to credentials at any time.
Create a `.env` file, ensure it is ignored in `.gitignore` if you are pushing to a repo, and store the credentials like this:

```bash
CLIENT_ID = <coveo-client-id>
CLIENT_SECRET = <coveo-client-secret>
SEARCH_TOKEN = <coveo-search-token>
```
Now, your app is configured to work with Coveo. From here on, you can start setting up tests for your app and updating the app based on changes you make.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Testing the App

You can locally test the app from the command line with the `zapier test` command. Before you do that though, there are a few things you must do beforehand.

First, navigate to your `.env` file once more and you'll need to enter the following:

```bash
TEST_ORG_ID = <coveo-org-id>
TEST_SOURCE_ID = <coveo-source-id>
ACCESS_TOKEN = <coveo-source-api-key>
```
These values will allow you to test to the specified source in the desired organization anytime locally. Within the `test/creates`, `test/utils.js`, and `test/searches` files, you can replace the
contents of the `bundle.inputData` or test case values with whatever you wish, as long as the required input fields are there for tests that require outbound requests. The `test/authentication` and `test/triggers` files shouldn't need anything changed unless you desire.

This gives access to your source in your organization. Now, you can begin to test with the `zapier test` command.
Note: You probably should replace all of the `inputData` fields, since the ones in the repo will most likely not work anymore.

If for any reason you are getting authentication errors about your `ACCESS_TOKEN` being invalid or anything else you put into `.env` not being detected, simply run this command and it should resolve the issue:

```bash
export ACCESS_TOKEN=<coveo-source-api-key>
export TEST_ORG_ID=<coveo-org-id>
export TEST_SOURCE_ID=<coveo-source-id>
```

Note: if you receive a timeout error, do not panic. The first run of the day will almost always timeout, and sometimes the network connections for the
app aren't very strong. Also, sometimes fetching content can take awhile on top of pushing or deleting, so a timeout error will occur but the test will keep running.
Completely wait until the app stops running and you can use the command line again. You should see some content appear in the console if the push/delete truly
failed or succeeded.

You can add `z.console.log` commands in the code to log anything that happens in the code and view them with `zapier logs`. Alternatively, you can view your logs and all happenings of the app from the Coveo Zap developers [monitoring section](https://zapier.com/developer/builder/cli-app/APP-ID/monitoring). You should remove these calls before pushing the final version of the app though.

You can also test the app on Zapier's site, and you should 100% do this, by heading over to Zapier's [site](https://zapier.com) and creating a Zap with the your app. You can create a Zap by clicking the `Make a Zap!` button at the top right of the home page. Please read the next section before testing on the site though.

Everything relating to what you can do on the command line as well as practical examples using Zapier can be found [here](https://github.com/zapier/zapier-platform-cli).

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Updating Changes to the App

You can freely add any changes locally and test them locally as well. Once you have done enough local testing and wish to push your changes to the app on Zapier for testing, since errors can occur unique to Zapier's site, you can do the following command `zapier push`.

DO NOT push the changed app as the same version as the live one, if you have a live app currently being used by users, unless the only changes are simple ones such as text or label changes. So, if the app is in version `1.0.2`, go into the `package.json` file and change the `version` key to a different number like `1.0.3`. If you push the app that still needs more testing that is currently used by users, you can potentially break things for them.

Once you have changed the version number, run `zapier push`. You can view your app's versions at anytime with `zapier versions`. Make sure to change the `package.json` `version`
key whenever you want to update versions separate from one another. You can delete app version at anytime with `zapier delete <version-number>`.

Now, after you've tested the updated app on the site EXTENSIVELY, you will want to promote the version for public access and migrate the users over to the current app.
This can be done by executing the following commands separately to ensure they completed:

```bash
zapier promote <updated-app-version-number>
// Success!
zapier migrate <current-live-app-version-number> <updated-app-version-number> [% of users to migrate]
```

`zapier promote` simply promotes the app version for public access. For `zapier migrate`, sometimes you do not want to migrate all of the users at once, since their Zaps can be in the process of running or the migration load may be too heavy. Doing this in intervals of 10-15% is best. Each migration can take 5-10 minutes, so be patient. Run `zapier help migrate` for more info.

To deprecate the old app and prevent any users from using broken versions, use the following command:

```bash
zapier deprecate <old-app-version-number> <date-to-remove-old-app>
```

You may need to run `zapier migrate` a few times in advance before your app is deprecated. Some user's won't select the current app version, so you'll need to migrate them over before the old app version gets removed. Run `zapier help deprecate` on what exactly occurs when you deprecate an app and when it's best to use it. All the other commands for `zapier` are ones concerned with collaboration and inviting users, which can all be done from within Zapier's [site](https://zapier.com/developer/builder), so it's easier to deal with them there. You can still utilize them if you'd like.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

Happy Zapping!
