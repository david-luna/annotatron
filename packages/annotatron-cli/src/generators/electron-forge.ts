import { execSync, writeFileSync, mkdirSync } from 'child_process';
import { execOptions, preloadTemplate } from './constants';

export const electronForge = (name: string): void => {
  // TODO: update path
  const command =  `npx create-electron-app ${name} --template=typescript`;

  console.log(command);
  // Use electron forge to create app
  const bootstrapResult = execSync(command, execOptions);

  // Add preload script
  const assetsPath = `${name}/assets`;
  mkdirSync(assetsPath, { recursive: true });
  writeFileSync(`${assetsPath}/preload.js`, preloadTemplate, { encodong: 'utf-8'});

  // Modify index.ts
  writeFileSync(`${name}/src/index.ts`, { encodong: 'utf-8'});
  const indexSource = readFilsSync(, { encoding: 'utf-8' });
  const sourceLines = indexSource.split('\n');
  const 
  const finalSource = [

  ].join('');
};
