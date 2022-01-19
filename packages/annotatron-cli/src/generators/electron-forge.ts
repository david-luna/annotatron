import { execSync } from 'child_process';
import { execOptions, preloadTemplate } from './constants';

export const electronForge = (name: string): void => {
  // TODO: update path
  const preloadPath = 'assets/preload.js';
  const command =  `npx create-electron-app ${name} --template=typescript`;

  console.log(command);
  const bootstrapResult = execSync(command, execOptions);
};
