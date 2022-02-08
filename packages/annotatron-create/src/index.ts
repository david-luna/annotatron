#!/usr/bin/env/node
import { exit } from 'process';
import { electronForge, electronBuilder, electronReact } from './generators';
// https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
// https://www.electronjs.org/docs/latest/tutorial/boilerplates-and-clis

const generators = {
  'electron-forge': electronForge,
  'electron-builder': electronBuilder,
  'electron-react': electronReact,
};
type GeneratorMap = typeof generators;

const templates = Object.keys(generators) as unknown as Array<keyof GeneratorMap>;

// Get arguments
const [, , name, templateName] = process.argv;
const template = templates.find((item) => item === templateName);

if (!name || !template) {
  // eslint-disable-next-line no-console
  console.log('usage: npx annotatron-create name template');
  // eslint-disable-next-line no-console
  console.log(`template = ${templates.join(' | ')}`);
  exit(0);
}

// run the generator
generators[template](name);
