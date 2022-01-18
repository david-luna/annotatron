#!/usr/bin/env/node

import { existsSync, statSync } from 'fs';
import { exit } from 'process';
import { electronForge, electronBuilder, electronReact } from './generators';
// https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
// https://www.electronjs.org/docs/latest/tutorial/boilerplates-and-clis

const generators = {
  'electron-forge': electronForge,
  'electron-builder': electronBuilder,
  'electron-react': electronReact,
};
const templates = Object.keys(generators);


// Get arguments
const [, , name, template] = process.argv;


if (!name || !template || !templates.some(t => t === template)) {
  // eslint-disable-next-line no-console
  console.log('usage: npx annotatron-create name template');
  console.log(`template = ${templates.join(' | ')}`);
  exit(0);
}

// run the generator
generators[template](name);
