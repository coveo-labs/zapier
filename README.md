# Coveo Zapier Integration
Source code for the Coveo integration.
The only availible integration currently is pushing to a Push Source

## Description
This uses the Zapier CLI app template. This repo has 2 versions of the app.
1. The API key version, which can push to Dev, QA and Prod -> Version 2.0.0 on Zapier
2. The OAuth 2 version (oauth2 branch) which can only push to Dev -> Version 3.0.0 on Zapier

## How-to build
If you follow the [Zapier CLI tutorial](https://github.com/zapier/zapier-platform-cli/wiki/Tutorial), it should be easier enough.
Use `zapier test` to see if it works.

## How-to run
Simply run `zapier push` then head over to the Zapier website and use it in a Zap