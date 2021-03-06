import { Injector } from './injector';
import { GenericClassDecorator, Type } from '../types';

export const INJECTED_METADATA_KEY = 'annotatron:injected';

/**
 * @returns {GenericClassDecorator<Type<unknown>>}
 * @constructor
 */
export const Injectable = (): GenericClassDecorator<Type<unknown>> => {
  return (target: Type<unknown>): unknown => {
    Injector.register(target);
    Reflect.defineMetadata(INJECTED_METADATA_KEY, true, target);

    return target;
  };
};
