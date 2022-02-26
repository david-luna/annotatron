#!/usr/bin/env node

const https = require('https')
const { exit } = require('process');
const { execSync } = require('child_process');

const teplatesUrl = 'https:///';

function getTemplates() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'raw.githubusercontent.com',
      port: 443,
      path: '/david-luna/annotatron/main/packages/annotatron-create/templates.json',
      method: 'GET'
    };
    const req = https.request(options, res => {
      res.on('data', (d) => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });
  
}

function generateProject(repo, name) {
  const command = [
    `git clone --depth 1 --branch main ${repo} ${name}`,
    `cd ${name}`,
    'rm -rf .git',
    'yarn', // TODO: npm i?
  ].join(' && ');
  
  execSync(command, { cwd: process.cwd(), stdio: 'inherit' });
}



// Get arguments
const [, , templateSelected, name] = process.argv;


console.log('Fetching template list');
getTemplates()
  .then((templates) => {
    const templateNames = Object.keys(templates);
    const template = templateNames.find((name) => name === templateSelected);

    if (!name || !template) {
      console.log('usage: npx annotatron-create {template} {name}');
      console.log(`template = ${templates.join(' | ')}`);
      console.log(`name = name-of-your-project`);
      exit(0);
    }

    // run the generator
    generateProject(repositories[template], name);
  });
