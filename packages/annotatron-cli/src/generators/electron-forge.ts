import { execSync, writeFileSync, mkdirSync } from 'child_process';
import { execOptions, preloadTemplate, sourceIndexForge, sourceAppModule } from './constants';

export const electronForge = (name: string): void => {
  const command = `npx create-electron-app ${name} --template=typescript`;

  // Use electron forge to create app
  const bootstrapResult = execSync(command, execOptions);

  // Add preload script
  const assetsPath = `${name}/assets`;
  mkdirSync(assetsPath, { recursive: true });
  writeFileSync(`${assetsPath}/preload.js`, preloadTemplate, { encodong: 'utf-8' });

  // Modify index.ts
  writeFileSync(`${name}/src/index.ts`, sourceIndexForge, { encodong: 'utf-8' });

  // Add application module
  writeFileSync(`${name}/src/application.ts`, sourceAppModule, { encodong: 'utf-8' });
};
