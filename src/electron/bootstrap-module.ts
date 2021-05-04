import { Type, isPromise } from '../types';
import { MODULE_METADATA_KEY, MODULE_IMPORTS_KEY, MODULE_PROVIDERS_KEY } from './electron-module';
import { ElectronMainEmitter } from './electron-types';
import { Injector } from '../injectable';
import { COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY } from './command-query-event';

// Communication channels
const Channels = {
  Results: 'annotatron:results',
  Errors: 'annotatron:errors',
  Events: 'annotatron:events',
};

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
const connectProvider = (provider: Type<unknown>, emitter: ElectronMainEmitter): void => {
  const streams = [COMMANDS_METADATA_KEY, QUERIES_METADATA_KEY, EVENTS_METADATA_KEY];
  const instance = Injector.resolve(provider);

  streams.forEach((stream) => {
    const streamObservers = (Reflect.getMetadata(stream, provider) || {}) as Record<string, string[]>;
    const observedTypes = Object.keys(streamObservers);

    observedTypes.forEach((typeName) => {
      const eventName = `${stream}:${typeName}`;
      const methods = streamObservers[typeName];
      methods.forEach((method) => connectMethod(instance, method, eventName, emitter));
    });
  });
};

/**
 * Returns a list of the providers of the given module along with the providers of its sub-modules
 * if it has
 *
 * @param moduleWithProviders the module from where we want to extract providers
 * @returns a list od providers from the module and its sub-modules
 */
const getProviders = (moduleWithProviders: Type<unknown>): Type<unknown>[] => {
  // Check if it's a module
  const isModule = Reflect.getMetadata(MODULE_METADATA_KEY, moduleWithProviders) as boolean;

  if (!isModule) {
    throw new Error(`Imported class ${moduleWithProviders.name} is not a module`);
  }

  const imports = Reflect.getMetadata(MODULE_IMPORTS_KEY, moduleWithProviders) as Type<unknown>[];
  const providers = Reflect.getMetadata(MODULE_PROVIDERS_KEY, moduleWithProviders) as Type<unknown>[];

  return imports
    .reduce((acc, mod) => acc.concat(getProviders(mod)), providers)
    .filter((provider, index, list) => list.indexOf(provider) === index);
};

/**
 * Resolves all providers of the target module and its sub modules and connects them to the
 * proper communications channels
 *
 * @param targetModule the module to bootstrap
 * @param emitter the main process emitter (ipcMain)
 */
export const bootstrapModule = (targetModule: Type<unknown>, emitter: ElectronMainEmitter): void => {
  const providers = getProviders(targetModule);

  providers.forEach((provider) => connectProvider(provider, emitter));
};
