/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable, INJECTED_METADATA_KEY } from './injectable';
import { Injector } from './injector';

jest.mock('./injector', () => ({
  Injector: { register: jest.fn() },
}));

describe('The @Injectable decorator', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should instantiate any decorated class as is, without interfering its type', () => {
    @Injectable()
    class ConstructorTestClass {}

    const testObject = new ConstructorTestClass();
    expect(testObject instanceof ConstructorTestClass).toBeTruthy();
  });

  it('should add metadata to the decorated class constructor', () => {
    @Injectable()
    class MetadataTestClass {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = MetadataTestClass as any;
    const metadata = Reflect.getMetadata(INJECTED_METADATA_KEY, target.constructor);

    expect(metadata).toEqual(true);
  });

  it('should register the decorated class constructor type through the Injector.register() static method', () => {
    @Injectable()
    class RegisterTestClass {}

    expect(Injector.register).toHaveBeenCalledWith(RegisterTestClass);
  });
});
