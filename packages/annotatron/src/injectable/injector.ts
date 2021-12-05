/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import { Type } from '../types';

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

  static register(constructorFunction: Function): void {
    const constructorParams = Reflect.getMetadata('design:paramtypes', constructorFunction) || [];

    Injector.dependenciesVault.set(constructorFunction, { constructorFunction, constructorParams });
  }

  static overrideToken(destinationToken: Function, sourceToken: Function): void {
    [destinationToken, sourceToken].forEach((token) => {
      if (!Injector.dependenciesVault.has(token)) {
        throw new Error(
          `A token with the [${token.prototype.constructor.name}] constructor could not be found in the injector.`,
        );
      }
    });

    const dependency = Injector.dependenciesVault.get(destinationToken) as Dependencies;

    if (dependency.constructorFunction !== destinationToken) {
      throw new Error(
        `The token with the [${destinationToken.prototype.constructor.name}] constructor is already overridden.`,
      );
    }

    // eslint-disable-next-line prettier/prettier
    Injector.dependenciesVault.set(
      destinationToken,
      Injector.dependenciesVault.get(sourceToken) as Dependencies,
    );
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

      // Put instance for overrides
      if (constructorFunction !== token && Injector.dependenciesVault.has(constructorFunction)) {
        Injector.instancesVault.set(constructorFunction, tokenInstance as Object);
      }
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
