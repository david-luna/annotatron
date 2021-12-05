/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * Type for what object is instances of
 */
export interface Type<T> extends Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

export interface AbstractType<T> extends Function {
  prototype: T;
}

/**
 * Generic `ClassDecorator` type
 */
export type GenericClassDecorator<T> = (target: T) => void;

/**
 * Generic `MethodDecorator` type
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type GenericMethodDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

// Type Guards
/**
 * Tells if the value is a promise
 * @param value the value to check
 */
export const isPromise = (value: any): value is Promise<unknown> => {
  return value && typeof value.then === 'function';
};
