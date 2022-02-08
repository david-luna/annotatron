import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { execOptions, sourcePreload, sourceIndexForge, sourceAppModule, writeSourceOptions } from './constants';

export const electronReact = (name: string): void => {
  // TODO: update path
  const preloadPath = 'assets/preload.js';
  const repo = 'https://github.com/electron-react-boilerplate/electron-react-boilerplate.git';
  // eslint-disable-next-line prettier/prettier
  const command = [
    `git clone --depth 1 --branch main ${repo} ${name}`,
    `cd ${name}`,
    'rm -rf .git',
    'npm i',
  ].join(' && ');

  // eslint-disable-next-line no-console
  console.log(command);
  const bootstrapResult = execSync(command, execOptions);
  // eslint-disable-next-line no-console
  console.log(bootstrapResult);

  // Add preload script
  const mainPath = `${name}/src/main`;
  mkdirSync(mainPath, { recursive: true });
  writeFileSync(`${mainPath}/preload.js`, sourcePreload, writeSourceOptions);

  // Modify index.ts
  writeFileSync(`${mainPath}/main.ts`, sourceIndexForge, writeSourceOptions);

  // Add application module
  writeFileSync(`${mainPath}/application.ts`, sourceAppModule, writeSourceOptions);
};
