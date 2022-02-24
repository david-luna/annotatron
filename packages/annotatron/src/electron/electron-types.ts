/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ElectronMainEvent {
  // Partial of: https://electronjs.org/docs/api/structures/ipc-main-event
  frameId: number;
  processId: number;
  // WebContents simplification
  sender: ElectronEmitter;
}

export interface ElectronEmitter extends NodeJS.EventEmitter {
  send(channel: string, ...args: any[]): void;
}

export interface ElectronMainEmitter extends NodeJS.EventEmitter {
  on(channel: string, listener: (event: ElectronMainEvent, ...args: any[]) => void): this;
}

interface BrowserWindowOptions {
  [option: string]: unknown;
  webPreferences: {
    [preference: string]: unknown;
    contextIsolation: boolean;
    enableRemoteModule: boolean;
    preload: string;
  };
}

export interface BrowserWindow extends NodeJS.EventEmitter {
  webContents: ElectronEmitter;
}

export type BrowserWindowConstructor = {
  new (options: BrowserWindowOptions): BrowserWindow;
};

export interface ElectronApi {
  ipcMain: ElectronMainEmitter;
  BrowserWindow: BrowserWindowConstructor;
}
