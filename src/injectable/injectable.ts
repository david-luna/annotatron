import { Injector } from './injector';
import { GenericClassDecorator, Type } from '../types';

/**
 * Use to configure the injection
 */
export interface InjectableParams {
  // eslint-disable-next-line @typescript-eslint/ban-types
  overrides?: Function;
}

export const INJECTED_METADATA_KEY = 'annotatron:injected';

/**
 * @returns {GenericClassDecorator<Type<unknown>>}
 * @constructor
 */
export const Injectable = (params?: InjectableParams): GenericClassDecorator<Type<unknown>> => {
  return (target: Type<unknown>): unknown => {
    // eslint-disable-next-line no-console
    if (!!params && !!console && typeof console.log === 'function') {
      // eslint-disable-next-line no-console
      console.log('Warning: Injectable params will be removed soon');
    }
    Injector.register(target, params);
    Reflect.defineMetadata(INJECTED_METADATA_KEY, true, target.constructor);

    return target;
  };
};
