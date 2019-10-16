const request = require('axios');
const fs = require('fs');
const klawSync = require('klaw-sync');
const argv = require('yargs').argv;

let arrayOfTests = featureParser();

arrayOfTests.forEach( test => {
    let requestType = {
        method: `PUT`,
        url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${test.tag}`,
        headers: {
            "Content-Type": "application/json",
            cookie: `JSESSIONID=${argv.cookie}`
        },
        data: {
            fields: {
                customfield_12291: test.type
            }
        },
        json: true
    };

    let requestSteps = {
        method: `PUT`,
        url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${test.tag}`,
        headers: {
            "Content-Type": "application/json",
            cookie: `JSESSIONID=${argv.cookie}`
        },
        data: {
            fields: {
                customfield_12292: test.steps
            }
        },
        json: true
    };

    return request(requestType)
        .then(() => {return request(requestSteps)})
        .catch((error) => console.log(error));
});


function featureParser() {
    const featurePath = argv.path === undefined ? 'featureFiles' : argv.path;
    const files = klawSync(featurePath, {nodir: true});
    let featureFiles = [];
    files.forEach( file => {
        if(file.path.endsWith('.feature')) featureFiles.push(file.path);
    });

    let requestData = [];
    featureFiles.forEach(file => {
        let arrayOfTests = fs.readFileSync(file, 'utf8').split('@');
        let result1 = arrayOfTests.filter(scenario => scenario.includes('jira(') && scenario.includes('Scenario'));
        result1.forEach(scenario => {
            let requestBody = {};
            let regex = /jira\(([^\)]+)\)/g;

            requestBody.tag = scenario.match(regex)[0].substring(5, scenario.match(regex)[0].length-1);
            requestBody.type = scenario.includes("Outline") ? {"id" : "13894"} : {"id" : "13893"};
            requestBody.steps = ("Given" + scenario.split("Given")[1]).trim();

            requestData.push(requestBody)
        });
    });
    return requestData;
}