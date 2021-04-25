/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import { Type } from '../types';
import { InjectableParams } from './injectable';

interface Dependencies {
  constructorFunction: Function;
  constructorParams: Function[];
}

/**
 * The Injector stores services and resolves requested instances.
 */
export class Injector {
  private static dependenciesVault = new Map<Function, Dependencies>();
  private static instancesVault = new Map<Function, object>();

  static register(constructorFunction: Function, params?: InjectableParams): void {
    const token = params?.overrides ?? constructorFunction;

    if (!Injector.dependenciesVault.has(token)) {
      const constructorParams = Reflect.getMetadata('design:paramtypes', constructorFunction) || [];

      Injector.dependenciesVault.set(token, { constructorFunction, constructorParams });
    }
  }
  /**
   * Resolves instances by injecting required services
   * @param {Type<T>} target
   * @returns {T}
   */
  static resolve<T>(token: Type<T>): T {
    if (Injector.instancesVault.has(token)) {
      return (Injector.instancesVault.get(token) as unknown) as T;
    }

    if (Injector.dependenciesVault.has(token)) {
      const dependencies = Injector.dependenciesVault.get(token) as Dependencies;
      const { constructorFunction, constructorParams } = dependencies;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const injections = constructorParams.map((param: any) => Injector.resolve<any>(param));
      const tokenConstructor = constructorFunction as Type<unknown>;
      const tokenInstance = new tokenConstructor(...injections);

      Injector.instancesVault.set(token, tokenInstance as Object);
      return tokenInstance as T;
    }

    throw new Error(
      `A token with the [${token.prototype.constructor.name}] constructor could not be found in the injector.`,
    );
  }

  static reset(): void {
    Injector.dependenciesVault.clear();
    Injector.instancesVault.clear();
  }
}
