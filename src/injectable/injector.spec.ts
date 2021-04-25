/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injector } from './injector';

class StubbedClassA {
  description = 'Test A';
}

class StubbedClassB {
  description = 'Test B';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StubbedDepsClass {
  description = 'Test C: Upstream dependencies';
  constructor(public depA: StubbedClassA, public depB: StubbedClassB) {}
}

describe('The static Injector', () => {
  beforeEach(() => {
    Injector.reset();
  });

  it('should allow to retrieve a singleton instance after registering it through the register API', () => {
    Injector.register(StubbedClassA);
    const instanceObjectA = Injector.resolve(StubbedClassA);
    expect(instanceObjectA).toBeDefined();
    expect(instanceObjectA instanceof StubbedClassA).toBeTruthy();

    instanceObjectA.description = 'Overridden test description';

    Injector.register(StubbedClassA);
    const anotherInstanceObjectA = Injector.resolve(StubbedClassA);
    expect(anotherInstanceObjectA.description).toBe('Overridden test description');
    expect(anotherInstanceObjectA instanceof StubbedClassA).toBeTruthy();
  });

  // eslint-disable-next-line max-len
  it('should allow to retrieve several singleton instances at once after registering them through the register API', () => {
    Injector.register(StubbedClassA);
    Injector.register(StubbedClassB);

    const instanceObjectA = Injector.resolve(StubbedClassA);
    const instanceObjectB = Injector.resolve(StubbedClassB);

    expect(instanceObjectA).toBeDefined();
    expect(instanceObjectB).toBeDefined();
    expect(instanceObjectA instanceof StubbedClassA).toBeTruthy();
    expect(instanceObjectB instanceof StubbedClassB).toBeTruthy();
  });

  it('should allow to override a type with another', () => {
    Injector.register(StubbedClassB, { overrides: StubbedClassA });

    const instanceObjectA = Injector.resolve(StubbedClassA);

    expect(instanceObjectA).toBeDefined();
    expect(instanceObjectA instanceof StubbedClassA).not.toBeTruthy();
    expect(instanceObjectA instanceof StubbedClassB).toBeTruthy();
  });

  it('should throw an error when attempting to fetch a dependency that does not exist', () => {
    expect(Injector.resolve.bind(null, StubbedClassA)).toThrow();
  });

  // eslint-disable-next-line max-len
  it('should expose an API to reset and clear out its types and objects internal collections while leaving type references intact', () => {
    Injector.register(StubbedClassA);
    const instanceObjectA = Injector.resolve(StubbedClassA);
    Injector.reset();

    expect(instanceObjectA).toBeDefined();
    expect(instanceObjectA instanceof StubbedClassA).toBeTruthy();
    expect(Injector.resolve.bind(null, StubbedClassA)).toThrow();
  });
});
