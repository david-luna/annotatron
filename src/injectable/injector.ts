import 'reflect-metadata';
import { Type } from '../types';
import { InjectableParams } from './injectable'

interface Dependencies {
  constructorFunction: Function;
  constructorParams: Function[];
}


/**
 * The Injector stores services and resolves requested instances.
 */
export const Injector = new class {
  private dependenciesVault = new Map<Function, Dependencies>();
  private instancesVault = new Map<Function, object>();

  register(constructorFunction: Function, params?: InjectableParams): void {
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
  resolve<T>(token: Type<T>): T {

    if (Injector.instancesVault.has(token)) {
      return Injector.instancesVault.get(token) as unknown as T;
    }

    if (Injector.dependenciesVault.has(token)) {
      const dependencies = Injector.dependenciesVault.get(token) as Dependencies;
      const { constructorFunction, constructorParams } = dependencies;
      const injections = constructorParams.map((token: any) => Injector.resolve<any>(token));
      const tokenConstructor = constructorFunction as Type<any>;
      const tokenInstance = new tokenConstructor(...injections);

      Injector.instancesVault.set(token, tokenInstance as any);

      return tokenInstance;
    }

    throw new Error(
      `A token with the [${token.prototype.constructor.name}] constructor could not be found in the injector.`
    );
  }

  reset(): void {
    Injector.dependenciesVault.clear();
    Injector.instancesVault.clear();
  }
};
