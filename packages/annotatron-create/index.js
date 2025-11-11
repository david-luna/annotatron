#!/usr/bin/env node

// required
const fetchJson = require('./fetch');
const { exit } = require('process');
const { execSync } = require('child_process');


// Fetch constants
const host = 'raw.githubusercontent.com';
const branch = 'david-luna/annotatron/main';
const path = 'packages/annotatron-create/templates.json';
const templatesUrl = `https://${host}/${branch}/${path}`;

// Arguments
const [, , templateSelected, name] = process.argv;

console.log('Fetching template list');
fetchJson(templatesUrl)
  .then((templates) => {
    const templateNames = Object.keys(templates);
    const templateRepo = templates[templateSelected];

    if (!name || !templateRepo) {
      console.log('usage: npx annotatron-create {template} {name}');
      console.log(`template = ${templateNames.join(' | ')}`);
      console.log(`name = name-of-your-project`);
      exit(0);
    }

    // run the generator
    const command = [
      `git clone --depth 1 --branch main ${templateRepo} ${name}`,
      `cd ${name}`,
      'rm -rf .git',
      'yarn',
    ].join(' && ');
    
    execSync(command, { cwd: process.cwd(), stdio: 'inherit' });
  });
