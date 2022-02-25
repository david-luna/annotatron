#!/usr/bin/env node

const { exit } = require('process');
const { execSync } = require('child_process');

function generateProject(repo, name) {
  const command = [
    `git clone --depth 1 --branch main ${repo} ${name}`,
    `cd ${name}`,
    'rm -rf .git',
    'yarn', // TODO: npm i?
  ].join(' && ');
  
  execSync(command, { cwd: process.cwd(), stdio: 'inherit' });
}
// Constants
const repositories = {
  'vue': 'https://github.com/david-luna/annotatron-vue-template.git',
  'react': 'https://github.com/david-luna/annotatron-react-template.git',
};
const templates = Object.keys(repositories);

// Get arguments
const [, , templateName, name] = process.argv;
const template = templates.find((item) => item === templateName);

if (!name || !template) {
  console.log('usage: npx annotatron-create {template} {name}');
  console.log(`template = ${templates.join(' | ')}`);
  console.log(`name = name-of-your-project`);
  exit(0);
}

// run the generator
generateProject(repositories[template], name);