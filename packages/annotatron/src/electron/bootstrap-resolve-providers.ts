import 'reflect-metadata';
import { Provider, ReflectiveInjector, Type } from 'injection-js';
import { MODULE_METADATA_KEY, MODULE_IMPORTS_KEY, MODULE_PROVIDERS_KEY } from './electron-module';

/**
 * Returns a list of the providers of the given module along with the providers of its sub-modules
 * if it has
 *
 * @param moduleWithProviders the module from where we want to extract providers
 * @returns a list od providers from the module and its sub-modules
 */
const getModuleProviders = (moduleWithProviders: Type<unknown>): Provider[] => {
  const isModule = Reflect.getMetadata(MODULE_METADATA_KEY, moduleWithProviders) as boolean;

  if (!isModule) {
    throw new Error(`Imported class ${moduleWithProviders.name} is not a module`);
  }

  const moduleImports = Reflect.getMetadata(MODULE_IMPORTS_KEY, moduleWithProviders) as Type<unknown>[];
  const moduleProviders = Reflect.getMetadata(MODULE_PROVIDERS_KEY, moduleWithProviders) as Provider[];

  return moduleImports
    .reduce((acc, mod) => acc.concat(getModuleProviders(mod)), moduleProviders)
    .filter((provider, index, list) => list.indexOf(provider) === index);
};

/**
 * Resolves all providers of the target module and its sub modules making sure there is no
 * misconfiguration
 *
 * @param targetModule the module to bootstrap
 * @returns the list of providers
 */
export const bootstrapResolveProviders = (targetModule: Type<unknown>): Provider[] => {
  const providers = getModuleProviders(targetModule);
  const injector = ReflectiveInjector.resolveAndCreate(providers);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return providers.map((p) => injector.get((p as any).provide || p));
};
