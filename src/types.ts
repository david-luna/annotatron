/**
 * Type for what object is instances of
 */
export interface Type<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
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
