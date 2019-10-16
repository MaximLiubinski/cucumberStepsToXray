### How to install:

```
$> npm install
```
### How to send steps to jira:
+ pathToFeatures - optional. Path to feature files with cucumber scenarios. Default folder - featureFiles
+ cookieToJira - required. Cookie for jira API requests
```
$> npm run import --path "<pathToFeatures>" --cookie "<cookieToJira>"
```