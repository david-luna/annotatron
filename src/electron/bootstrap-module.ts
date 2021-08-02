import { Injector } from '../injectable';
import { Type, isPromise } from '../types';
import { ModuleProvider } from './electron-module';
import { ElectronMainEmitter, BrowserWindow } from './electron-types';
import { bootstrapResolveProviders, isType } from './bootstrap-resolve-providers';
import { COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY } from './command-query-event';

interface CommandQueryOrEvent {
  type: string; // decorators refer to this property
  payload: unknown; // the decorated method will receive this as parameter
}

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
 * @param channel the channel used based on the message nature (command, query, event)
 * @param type the type of the message we want to listen
 * @param emitter the event emitter
 */
const connectMethod = (
  instance: unknown,
  method: string,
  channel: string,
  type: string,
  emitter: ElectronMainEmitter,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitter.on(channel, (evt, data) => {
    // Commands & Queries come from an ipcRenderer so they have the event as 1st param
    // Events make use of nodejs Emitter API so the 1st param is the message
    const isEventChannel = channel === Channels.Events;
    const message = (isEventChannel ? evt : data) as CommandQueryOrEvent;

    if (message.type !== type) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (instance as any)[method](message.payload);

      if (channel === Channels.Events) {
        return;
      }

      if (isPromise(result)) {
        result
          .then((value) => evt.sender.send(Channels.Results, value))
          .catch((error) => evt.sender.send(Channels.Errors, error));
      } else if (result) {
        evt.sender.send(Channels.Results, result);
      }
    } catch (error) {
      evt.sender && evt.sender.send(Channels.Errors, error);
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

  const channels = [COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY];
  const instance = Injector.resolve(classToConnect);

  channels.forEach((channel) => {
    const observerClass = classToConnect;
    const channelObservers = (Reflect.getMetadata(channel, observerClass) || {}) as Record<string, string[]>;
    const observedTypes = Object.keys(channelObservers);

    observedTypes.forEach((type) => {
      const methods = channelObservers[type];
      methods.forEach((method) => connectMethod(instance, method, channel, type, emitter));
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
export const emitEvent = (data: CommandQueryOrEvent): void => {
  if (mainEmitter !== void 0) {
    mainEmitter.emit(`${Channels.Events}`, data);
    browserWindows.forEach((windowInstance) => {
      windowInstance.webContents.send(Channels.Events, data);
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
