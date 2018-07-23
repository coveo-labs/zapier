# Coveo Zapier Integration

This is the code for the integration of the Coveo Zap app on Zapier. It is capable of extracting the content
of files or urls, then indexing that content into a specified push source on the Coveo Cloud Platform as either a
single item push, or a batch. The batch push is currently limited to zip files only.

## Setting Up The App

Before starting anything Zapier related, it will probably be helpful to brush up on some of Coveo's API. 
Head [here](https://platform.cloud.coveo.com/docs?api=Platform) for a refresher or to get antiquated with 
Coveo API, as many different calls using the API are used within this project.

For general information regarding Zapier, follow this [link](https://zapier.com/developer/documentation/v2/) to their main
documentation page. Since this is part of their CLI Interface, you may also find it useful to have [this](https://www.npmjs.com/package/zapier-platform-cli) or
[this](https://zapier.github.io/zapier-platform-cli/cli.html) on hand.

In order to get a better grasp of the requirements for the CLI as well as how it functions, follow the first section, the setup portion, of this [tutorial](https://zapier.com/developer/start/introduction).
You can follow the entire tutorial if you wish, but do not clone the Coveo app if you do, clone their example app instead.

Note: you will need your own Zapier account or the Coveo Zapier account information in order to login from the command line in the `Run Zapier Login` step in the tutorial. If you
choose to login from another account other than Coveo's, you will need to change the contents of the config file to the dev platform as well as get the correct redirect_uri
after pushing the app for the first time. Hence, it is suggested you login with the Coveo Zapier account. Contact whomever has it on hand.

Once you have completed the set up and logged in, you'll want to clone the Coveo app, move into the directory where the app code was stored, and install it's components:

```bash
git clone https://github.com/coveo-labs/zapier.git
cd zapier
npm install
```
Now, you should have the app and all of it's dependencies installed in the directory. If the app failed to update on it's own, run the following commands to
ensure the app is updated:

```bash
sudo npm install zapier-platform-cli
sudo npm install zapier-platform-core
```
The basics of setting up the app should be complete at this point. If any problems arose, diagnose them from the errors in the command line
and resolve them.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Adding in the Coveo App's Specific Information

Now you'll have to update any information that is specific to the Coveo App. First, navigate to the `config.json` file. You should find the following inside:

```json
{
 "PLATFORM": "platform.cloud.coveo.com",
 "PUSH": "push.cloud.coveo.com",
 "REDIRECT_URI": "https://zapier.com/dashboard/auth/oauth/return/APP-ID/"
}
```

From here, ensure that `PLATFORM` and `PUSH` are the values associated with the Prod platform for Coveo. If for any reason you wish to change these two
to either dev or qa (solely for testing purposes only), DO NOT push the same version of the app when you do. See the section regarding updating the app as to why you must do this. 

Next, ensure the `REDIRECT_URI` is the following: `https://zapier.com/dashboard/auth/oauth/return/APP-ID/`. If it isn't, update it. Next, run `zapier describe` on 
the command line to get the correct `REDIRECT_URI`. It will be located in the `Authentication` section of the output. Copy paste the url into the `REDIRECT_URI`
in `config.json`. The following should be the content of `config.json`:

```json
{
 "PLATFORM": "platform.cloud.coveo.com",
 "PUSH": "push.cloud.coveo.com",
 "REDIRECT_URI": "https://zapier.com/dashboard/auth/oauth/return/APP-IDCLIAPI/"
}
```

Finally, you'll want to tell Zapier what `CLIENT_ID` and `CLIENT_SECRET` to use when authenticating with Coveo. You will 
also need the version number of the app. You can get the app version by running `zapier versions` on the command line. Get these client credentials
and enter the following commands:

```bash
zapier env <coveo-app-version> CLIENT_ID <coveo-client-id>
zapier env <coveo-app-version> CLIENT_SECRET <coveo-client-secret>
```

To ensure the environment was setup correctly, run `zapier env <coveo-app-version>`. If the credentials match up, you've finished setting up the app.
Note: you should probably set up a `.env` file to store these credentials. This isn't required, but it is very helpful for Zapier and let's you have access to credentials at any time.
Create a `.env` file, ensure it is ignored in `.gitignore`, and store the credentials like this:

```bash
CLIENT_ID = <coveo-client-id>
CLIENT_SECRET = <coveo-client-secret>
```

IMPORTANT: once all of the credentials and the app has been installed locally, DO NOT EVER use the command `zapier init .` and then `zapier push`. You
will completely overwrite the app and it will stop working for anyone using it. Just avoid `zapier init .` completely unless you are in a different directory
and want to start a completely new app.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Testing the App

You can locally test the app from the command line with the `zapier test` command. Before you do that though, there are a few things you must do beforehand.

First, you need to navigate to the `test/creates` folder. Once, there you'll see two test files, `push.js` and `delete.js`. DO NOT replace anything in these files besides
the following:

 1. `const orgId`
 1. `const sourceId`
 1.  The values of the keys within the `inputData` in the `bundle`

Replace the `const orgId` and `const sourceId` values with the corresponding source and organization IDs you wish to push to.
The values of the `inputData` can be anything you wish, but do not change the keys unless absolutely necessary.

Now, you'll have to give authentication to the local test. This requires an access token to your source. Since we cannot generate access tokens in
these files, we must do the following commands on the command line:

```bash
export ACCESS_TOKEN=<coveo-source-api-key>
export REFRESH_TOKEN=<coveo-source-api-key>
```

This gives access to your source in your organization. Now, you can begin to test with any values you put into the `inputData` fields with the `zapier test` command.
You should replace all of the `inputData` fields, since the ones in the repo will most likely not work anymore.

Note: if you receive a timeout error, do not panic. The first run of the day will almost always timeout, and sometimes the network connections for the
app aren't very strong. Also, sometimes fetching content can take awhile ontop of pushing or deleting, so a timeout error will occur but the test will keep running.
Completey wait until the app stops running and you can use the command line again. You should see some content appear in the console if the push/delete truly
failed or succeeded.

You can add `z.console.log` commands in the code to log anything that happens in the code and view them with `zapier logs`. Alternatively, you can view your logs and all happenings of the app from the Coveo Zap developers [monitoring section](https://zapier.com/developer/builder/cli-app/APP-ID/monitoring). You should remove these calls before pushing the final version of the app though.

You can also test the app on Zapier's site, you should 100% do this, by heading over to Zapier's [site](https://zapier.com) and creating a Zap with the Coveo Zap app. Please
read the next section before testing on the site though.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

## Updating Changes to the App

You can freely add any changes locally and test them locally as well. Once you have done enough local testing and wish to push your changes to the app
on Zapier for testing, since errors can occur there unqiue to Zapier's site, you can do the following command `zapier push`. 

DO NOT push the changed app as the same version as the live one unless the only changes are simple ones such as text or label changes. So, if the app is in version `1.0.2`, go into the `package.json` file and change the `version` key to a different number like `1.0.3`. If you push the app that still needs more testing that is currently used by users, you can potentially break things for them. 

Once you have changed the version number, run `zapier push`. You can view your app's versions at anytime with `zapier versions`. Make sure to change the `package.json` `version`
key whenever you want to update versions separate from one another. You can delete app version at anytime with `zapier delete <version-number>`.

Now, after you've tested the updated app on the site EXTENSIVELY, you will want to promote the version for public access and migrate the users over to the current app.
This can be done by executing the following commands separately to ensure they completed:

```bash
zapier promote <updated-app-version-number>
//Success!
zapier migrate <current-live-app-version-number> <updated-app-version-number> [% of users to migrate]
```

Sometimes you do not want to migrate all of the users at once, since their Zaps can be in the process of running or the migration load
may be too heavy. Doing this in intervals of 10-15% is best. Each migration can take 5-10 minutes, so be patient. Run `zapier help migrate` for more info.

To deprecate the old app, use the following command:

```bash
zapier deprecate <old-app-version-number> <date-to-remove-old-app>
```

Run `zapier help deprecate` on what exactly occurs when you deprecate an app and when it's best to use it. All the other commands for `zapier` are ones concerned with collaboration and inviting users, which can all be done from within Zapier's [site](https://zapier.com/developer/builder), so it's easier to deal with them there. You can still utilize them if you'd like.

At any point if you want to see the available zapier commands and what they do, run `zapier help` or for more info on specific commands run
`zapier help [command]`.

Happy Zapping!
