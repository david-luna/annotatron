import { Injector } from './injector';
import { GenericClassDecorator, Type } from '../types';

/**
 * Use to configure the injection
 */
export interface InjectableParams {
  overrides?: Function;
}

/**
 * @returns {GenericClassDecorator<Type<unknown>>}
 * @constructor
 */
export const Injectable = (
  params?: InjectableParams
): GenericClassDecorator<Type<unknown>> => {
  return (target: Type<unknown>): unknown => {
    Injector.register(target, params);

    return target;
  };
};
