import 'reflect-metadata';
import { Type, GenericClassDecorator } from '../types';

interface ImportsModuleParams {
  imports: Type<unknown>[];
  providers?: Type<unknown>[];
}

interface ProvidersModuleParams {
  imports?: Type<unknown>[];
  providers: Type<unknown>[];
}

type PartialModuleParams = ImportsModuleParams | ProvidersModuleParams;

export const MODULE_METADATA_KEY = 'annotatron:module';
export const MODULE_PROVIDERS_KEY = 'annotatron:module:providers';
export const MODULE_IMPORTS_KEY = 'annotatron:module:imports';

/**
 * Decorates a class as an electron module
 *
 * @param moduleParams module parameters with electron reference, imported modules ans providers
 * @returns {GenericClassDecorator<Type<unknown>>}
 * @constructor
 */
export const ElectronModule = (moduleParams: PartialModuleParams): GenericClassDecorator<Type<unknown>> => {
  return (target: Type<unknown>): unknown => {
    Reflect.defineMetadata(MODULE_METADATA_KEY, true, target);
    Reflect.defineMetadata(MODULE_PROVIDERS_KEY, moduleParams.providers || [], target);
    Reflect.defineMetadata(MODULE_IMPORTS_KEY, moduleParams.imports || [], target);
    return target;
  };
};
