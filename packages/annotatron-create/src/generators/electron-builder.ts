import { execSync } from 'child_process';
import { execOptions, sourcePreload } from './constants';

export const electronBuilder = (name: string): void => {
  const preloadPath = 'assets/preload.js';
  const repo = 'https://github.com/electron-userland/electron-webpack-quick-start.git';
  const command = [
    `git clone --depth 1 --branch master ${repo} ${name}`,
    `mv electron-webpack-quick-start ${name}`,
    `cd ${name}`,
    'rm -rf .git',
    'yarn',
  ].join(' && ');

  // eslint-disable-next-line no-console
  console.log(command);
  const bootstrapResult = execSync(command, execOptions);
  // eslint-disable-next-line no-console
  console.log(bootstrapResult);
};
