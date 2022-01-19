import { execSync } from 'child_process';
import { cwd, preloadTemplate } from './constants';

export const electronBuilder = (name: string): void => {
  const preloadPath = 'assets/preload.js';
  
  const repo = 'https://github.com/electron-userland/electron-webpack-quick-start.git';
  const command =  [
    `git clone --depth 1 --branch master ${repo} ${name}`,
    `mv electron-webpack-quick-start ${name}`,
    `cd ${name}`,
    'rm -rf .git',
    'yarn',
  ].join (' && ');

  console.log(command);
  const bootstrapResult = execSync(command, { cwd });
};
  