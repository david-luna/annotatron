import { Injector } from '../injectable';
import { Type, isPromise } from '../types';
import { ModuleProvider } from './electron-module';
import { ElectronMainEmitter, BrowserWindow } from './electron-types';
import { bootstrapResolveProviders, isType } from './bootstrap-resolve-providers';
import { COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY } from './command-query-event';

// Communication channels
const Channels = {
  Results: 'annotatron:results',
  Errors: 'annotatron:errors',
  Events: 'annotatron:events',
};

// Will keep references (overwritten by class decorator)
let mainEmitter: ElectronMainEmitter;
let browserWindows: BrowserWindow[];

/**
 * Connects a method of a given provider to a specific event sent by the emitter
 *
 * @param instance object as instance of a provider
 * @param method the name of the method we want to connect
 * @param eventName the name of the event the methods has to respond
 * @param emitter the event emitter
 */
const connectMethod = (instance: unknown, method: string, eventName: string, emitter: ElectronMainEmitter) => {
  emitter.on(eventName, (evt, args) => {
    try {
      // TODO: check for message shape? ({ type, payload })
      const payload = args[0].payload;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (instance as any)[method](payload);

      if (eventName.startsWith('annotatron:events')) {
        return;
      }

      if (isPromise(result)) {
        result
          .then((value) => evt.sender.send(Channels.Results, [value]))
          .catch((error) => evt.sender.send(Channels.Errors, [error]));
      } else if (result) {
        evt.sender.send(Channels.Results, [result]);
      }
    } catch (error) {
      evt.sender.send(Channels.Errors, [error]);
    }
  });
};

/**
 * Checks for message annotations in the given provider and connects it to the given emitter
 * if specified
 *
 * @param provider the provider to connect to the main process if annotated properly
 * @param emitter the main process emitter (ipcMain)
 */
const connectProvider = (provider: ModuleProvider, emitter: ElectronMainEmitter): void => {
  const classToConnect = isType(provider) ? provider : provider.useClass;

  const streams = [COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY];
  const instance = Injector.resolve(classToConnect);

  streams.forEach((stream) => {
    const observerClass = classToConnect;
    const streamObservers = (Reflect.getMetadata(stream, observerClass) || {}) as Record<string, string[]>;
    const observedTypes = Object.keys(streamObservers);

    observedTypes.forEach((typeName) => {
      const eventName = `${stream}:${typeName}`;
      const methods = streamObservers[typeName];
      methods.forEach((method) => connectMethod(instance, method, eventName, emitter));
    });
  });
};

/**
 * Adds the passed window object in the list of windows to be notified with events
 *
 * @param windowInstance an electron browser window object
 */
export const connectWindow = (windowInstance: BrowserWindow): void => {
  browserWindows.push(windowInstance);
  windowInstance.on('closed', () => {
    browserWindows.splice(browserWindows.indexOf(windowInstance), 1);
  });
};

/**
 * Sends a message to the events channel and the connected browser windows
 *
 * @param data event data
 */
export const emitEvent = (data: { type: string }): void => {
  if (mainEmitter !== void 0) {
    mainEmitter.emit(`${Channels.Events}:${data.type}`, [data]);
    browserWindows.forEach((windowInstance) => {
      windowInstance.webContents.send(Channels.Events, [data]);
    });
  }
};

/**
 * Resolves all providers of the target module and its sub modules and connects them to the
 * proper communications channels
 *
 * @param targetModule the module to bootstrap
 * @param emitter the main process emitter (ipcMain)
 */
export const bootstrapModule = (targetModule: Type<unknown>, emitter: ElectronMainEmitter): void => {
  const providers = bootstrapResolveProviders(targetModule);

  mainEmitter = emitter;
  browserWindows = [];
  providers.forEach((provider) => connectProvider(provider, emitter));
};
