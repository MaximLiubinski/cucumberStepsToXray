const request = require('axios');
const fs = require('fs');
const klawSync = require('klaw-sync');
const argv = require('yargs').argv;

let arrayOfTests = featureParser();

sendRequests(arrayOfTests);

async function sendRequests(testsData) {
    const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

    for(let i = 0; i < testsData.length ; i++) {
        let requestType = {
            method: `PUT`,
            url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${testsData[i].tag}`,
            headers: {
                "Content-Type": "application/json",
                cookie: `JSESSIONID=${argv.cookie}`
            },
            data: {
                fields: {
                    customfield_12290: {
                        "id": "13891"
                    }
                }
            },
            json: true
        };

        let requestScenarioType = {
            method: `PUT`,
            url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${testsData[i].tag}`,
            headers: {
                "Content-Type": "application/json",
                cookie: `JSESSIONID=${argv.cookie}`
            },
            data: {
                fields: {
                    customfield_12291: testsData[i].type
                }
            },
            json: true
        };

        let requestSteps = {
            method: `PUT`,
            url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${testsData[i].tag}`,
            headers: {
                "Content-Type": "application/json",
                cookie: `JSESSIONID=${argv.cookie}`
            },
            data: {
                fields: {
                    customfield_12292: testsData[i].steps
                }
            },
            json: true
        };

        await request(requestType).catch((error) => console.log(testsData[i].tag));
        await waitFor(5);
        await request(requestScenarioType).catch((error) => console.log(testsData[i].tag));
        await waitFor(50);
        await request(requestSteps).catch((error) => console.log(testsData[i].tag + i));
        await waitFor(50);
    }
}

function featureParser() {
    const featurePath = argv.path === undefined ? 'featureFiles' : argv.path;
    const files = klawSync(featurePath, {nodir: true});
    let featureFiles = [];
    files.forEach( file => {
        if(file.path.endsWith('.feature')) featureFiles.push(file.path);
    });

    let requestData = [];
    featureFiles.forEach(file => {
        let arrayOfTests = fs.readFileSync(file, 'utf8').split('@j');
        let result1 = arrayOfTests.filter(scenario => scenario.includes('ira(') && scenario.includes('Scenario'));
        result1.forEach(scenario => {
            let requestBody = {};
            let regex = /ira\(([^\)]+)\)/g;

            requestBody.tag = scenario.match(regex)[0].substring(4, scenario.match(regex)[0].length-1);
            requestBody.type = scenario.includes("Outline") ? {"id" : "13894"} : {"id" : "13893"};
            requestBody.steps = ("Given" + scenario.split("Given")[1]).trim();

            requestData.push(requestBody)
        });
    });
    return requestData;
}