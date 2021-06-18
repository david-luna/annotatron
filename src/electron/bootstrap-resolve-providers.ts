import 'reflect-metadata';
import { Type, AbstractType } from '../types';
import {
  MODULE_METADATA_KEY,
  MODULE_IMPORTS_KEY,
  MODULE_PROVIDERS_KEY,
  ModuleProvider,
  ModuleProviderWithClass,
} from './electron-module';
import { Injector, INJECTED_METADATA_KEY } from '../injectable';

// Type guard
const isType = (provider: ModuleProvider): provider is Type<unknown> => {
  return provider.constructor.name !== 'Object';
};

const checkTypeProvider = (provider: Type<unknown> | AbstractType<unknown>): void => {
  const isInjected = Reflect.getMetadata(INJECTED_METADATA_KEY, provider) as boolean;

  if (isInjected) {
    return;
  }

  throw new Error(`Provider ${provider.name} is not registered using the @Injectable decorator`);
};

const checkClassProvider = (provider: ModuleProviderWithClass, overriddenTokens: Map<unknown, unknown>): void => {
  const { provide, useClass } = provider;

  checkTypeProvider(provide);
  checkTypeProvider(useClass);

  if (overriddenTokens.has(provide)) {
    throw new Error(`Provider ${provide.name} is already overridden by ${useClass.name}`);
  }

  overriddenTokens.set(provide, useClass);
  Injector.overrideToken(provide, useClass);
};

/**
 * Returns a list of the providers of the given module along with the providers of its sub-modules
 * if it has
 *
 * @param moduleWithProviders the module from where we want to extract providers
 * @returns a list od providers from the module and its sub-modules
 */
const resolveProviders = (moduleWithProviders: Type<unknown>): ModuleProvider[] => {
  const isModule = Reflect.getMetadata(MODULE_METADATA_KEY, moduleWithProviders) as boolean;

  if (!isModule) {
    throw new Error(`Imported class ${moduleWithProviders.name} is not a module`);
  }

  const moduleImports = Reflect.getMetadata(MODULE_IMPORTS_KEY, moduleWithProviders) as Type<unknown>[];
  const moduleProviders = Reflect.getMetadata(MODULE_PROVIDERS_KEY, moduleWithProviders) as ModuleProvider[];

  return moduleImports
    .reduce((acc, mod) => acc.concat(resolveProviders(mod)), moduleProviders)
    .filter((provider, index, list) => list.indexOf(provider) === index);
};

/**
 * Resolves all providers of the target module and its sub modules and connects them to the
 * proper communications channels
 *
 * @param targetModule the module to bootstrap
 * @param emitter the main process emitter (ipcMain)
 */
export const bootstrapResolveProviders = (targetModule: Type<unknown>): void => {
  const overriddenTokens = new Map();

  resolveProviders(targetModule).forEach((provider) => {
    if (isType(provider)) {
      checkTypeProvider(provider);
    } else {
      checkClassProvider(provider, overriddenTokens);
    }
  });
};
