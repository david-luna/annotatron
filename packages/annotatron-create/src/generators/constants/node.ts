import { ExecSyncOptions } from 'child_process';
import { WriteFileOptions } from 'fs';

// CWD
export const execOptions: ExecSyncOptions = {
  cwd: process.cwd(),
  stdio: 'inherit',
};
// FS
export const writeSourceOptions: WriteFileOptions = { encoding: 'utf-8' };
