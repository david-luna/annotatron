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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isPromise = (value: any): value is Promise<unknown> => {
  return typeof value === 'object' && typeof value.then === 'function';
};
