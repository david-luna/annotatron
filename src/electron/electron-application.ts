/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericClassDecorator, isPromise, Type } from '../types';
import { COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY } from './command-query-event';
import { Injector } from '../injectable';
import { ElectronMainEmitter, ElectronApi, BrowserWindow } from './electron-types';

export interface ElectronParams {
  electron: ElectronApi;
  providers: Type<unknown>[];
}

interface EmittersPool {
  main: ElectronMainEmitter;
  windows: BrowserWindow[];
}

type BrowserWindowFactory = (...args: unknown[]) => BrowserWindow;

// Communication channels
const Channels = {
  Results: 'annotatron:results',
  Errors: 'annotatron:errors',
  Events: 'annotatron:events',
};

// Will keep references (overwritten by class decorator)
let emittersPool: EmittersPool;

/**
 * Broadcasts a message to all renderer windows and also in main process
 *
 * @param data data attached to the event
 */
export const emitEvent = (data: unknown): void => {
  if (emittersPool !== void 0) {
    // Notify all active renderers
    emittersPool.windows.forEach((win) => {
      win.webContents.send(Channels.Events, [data]);
    });
    // Notify observers on the main process
    emittersPool.main.emit(Channels.Events, [data]);
  }
};

/**
 * Wraps the static method of the electron app class that creates windows
 * the wrapper function updated the emitters pool with newly crated windows
 *
 * @param decoratedClass the application class being decorated
 */
const observeWindowFactory = (decoratedClass: any): void => {
  const createWindow = decoratedClass.createWindow as BrowserWindowFactory;

  if (!createWindow) {
    throw TypeError('Application class must have a static method named createWindow');
  }

  decoratedClass.createWindow = (...args: unknown[]) => {
    const rendererWindow = createWindow.apply(decoratedClass, args);
    emittersPool.windows.push(rendererWindow);
    rendererWindow.on('closed', () => {
      emittersPool.windows.splice(emittersPool.windows.indexOf(rendererWindow), 1);
    });
    return rendererWindow;
  };
};

/**
 * Resolves provider annotations into call to the proper event listener APIs of
 * the main process
 *
 * @param metadataKey the annotation key (Commands, Queries, Events)
 * @param provider the class of the application provider
 * @param main reference to electron's main process
 */
const resolveAnnotations = (metadataKey: string, provider: Type<unknown>, main: ElectronMainEmitter): void => {
  const observedTypes = (Reflect.getMetadata(metadataKey, provider) || {}) as Record<string, string[]>;
  const instance = Injector.resolve(provider) as any;
  const channel = metadataKey;

  Object.keys(observedTypes).forEach((typeName) => {
    const eventName = `${channel}:${typeName}`;
    const targetMethods = observedTypes[typeName];

    targetMethods.forEach((method) => {
      main.on(eventName, (evt, args) => {
        try {
          // TODO: check for message shape? ({ type, payload })
          const payload = args[0].payload;
          const result = instance[method](payload);

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
    });
  });
};

/**
 * @returns {GenericClassDecorator<Type<unknown>>}
 * @constructor
 */
export const ElectronApplication = (params: ElectronParams): GenericClassDecorator<Type<unknown>> => {
  return (target: Type<unknown>): unknown => {
    emittersPool = { main: params.electron.ipcMain, windows: [] };

    const providers = params.providers;
    const mainEmitter = params.electron.ipcMain;

    providers.forEach((provider) => {
      resolveAnnotations(COMMANDS_METADATA_KEY, provider, mainEmitter);
      resolveAnnotations(QUERIES_METADATA_KEY, provider, mainEmitter);
      resolveAnnotations(EVENTS_METADATA_KEY, provider, mainEmitter);
    });

    // All windows created with the window factory will get connected to events
    observeWindowFactory(target);

    return target;
  };
};
