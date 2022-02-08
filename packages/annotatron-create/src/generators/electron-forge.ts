import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { execOptions, sourcePreload, sourceIndexForge, sourceAppModule, writeSourceOptions } from './constants';

export const electronForge = (name: string): void => {
  const command = `npx create-electron-app ${name} --template=typescript`;

  // Use electron forge to create app
  const bootstrapResult = execSync(command, execOptions);
  // eslint-disable-next-line no-console
  console.log(bootstrapResult);

  // Add preload script
  const assetsPath = `${name}/assets`;
  mkdirSync(assetsPath, { recursive: true });
  writeFileSync(`${assetsPath}/preload.js`, sourcePreload, writeSourceOptions);

  // Modify index.ts
  writeFileSync(`${name}/src/index.ts`, sourceIndexForge, writeSourceOptions);

  // Add application module
  writeFileSync(`${name}/src/application.ts`, sourceAppModule, writeSourceOptions);
};
