/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injector } from './injector';
import { Injectable } from './injectable';

class StubbedClassA {
  description = 'Test A';
}

class StubbedClassB {
  description = 'Test B';
}

class StubbedClassC {
  description = 'Test C';
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

  it('should allow to retrieve a singleton instance with dependencies', () => {
    Injector.register(StubbedClassA);
    Injector.register(StubbedClassB);
    @Injectable()
    class StubbedDepsClass {
      description = 'Test C: Upstream dependencies';
      constructor(public depA: StubbedClassA, public depB: StubbedClassB) {}
    }

    const instanceObjectWithDeps = Injector.resolve(StubbedDepsClass);

    expect(instanceObjectWithDeps).toBeDefined();
    expect(instanceObjectWithDeps instanceof StubbedDepsClass).toBeTruthy();
    expect(instanceObjectWithDeps.depA instanceof StubbedClassA).toBeTruthy();
    expect(instanceObjectWithDeps.depB instanceof StubbedClassB).toBeTruthy();
  });

  it('should allow to override a type with another after registration', () => {
    Injector.register(StubbedClassA);
    Injector.register(StubbedClassB);
    Injector.overrideToken(StubbedClassA, StubbedClassB);

    const instanceObjectA = Injector.resolve(StubbedClassA);
    const instanceObjectB = Injector.resolve(StubbedClassB);

    expect(instanceObjectA).toBeDefined();
    expect(instanceObjectB).toBeDefined();
    expect(instanceObjectA instanceof StubbedClassA).not.toBeTruthy();
    expect(instanceObjectA instanceof StubbedClassB).toBeTruthy();
    expect(instanceObjectB instanceof StubbedClassB).toBeTruthy();
    expect(instanceObjectA).toBe(instanceObjectB);
  });

  it('should NOT allow to override a type if already overridden', () => {
    Injector.register(StubbedClassA);
    Injector.register(StubbedClassB);
    Injector.register(StubbedClassC);

    expect(() => {
      Injector.overrideToken(StubbedClassA, StubbedClassB);
      Injector.overrideToken(StubbedClassA, StubbedClassC);
    }).toThrow('already overridden');
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
