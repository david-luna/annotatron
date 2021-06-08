/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable, Injector } from '../injectable';
import { ElectronModule } from './electron-module';
import { bootstrapResolveProviders } from './bootstrap-resolve-providers';

describe('bootstrapResolveProviders', () => {
  beforeEach(() => {
    Injector.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if importing a non module class', () => {
    class NonDecoratedModuleClass {}
    @ElectronModule({
      imports: [NonDecoratedModuleClass],
      providers: [],
    })
    class MisconfiguredModuleClassOne {}

    try {
      bootstrapResolveProviders(MisconfiguredModuleClassOne);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not a module');
    }

    @Injectable()
    class WronglyDecoratedModuleClass {}
    @ElectronModule({
      imports: [WronglyDecoratedModuleClass],
      providers: [],
    })
    class MisconfiguredModuleClassTwo {}

    try {
      bootstrapResolveProviders(MisconfiguredModuleClassTwo);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not a module');
    }

    expect.assertions(4);
  });

  it('should throw an error if a provider is not injectable', () => {
    class NonDecoratedProviderClass {}
    @ElectronModule({
      providers: [NonDecoratedProviderClass],
    })
    class BadProviderModuleClass {}

    try {
      bootstrapResolveProviders(BadProviderModuleClass);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not registered using the @Injectable decorator');
    }

    class NonDecoratedProviderToBeOverriddenClass {}
    class NonDecoratedProviderOverrideClass {}
    @ElectronModule({
      providers: [
        {
          provide: NonDecoratedProviderToBeOverriddenClass,
          useClass: NonDecoratedProviderOverrideClass,
        },
      ],
    })
    class AnotherBadProviderModuleClass {}

    try {
      bootstrapResolveProviders(AnotherBadProviderModuleClass);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('could not be found in the injector');
    }

    expect.assertions(4);
  });

  it('should NOT throw if provider properly configured with injectable classes', () => {
    @Injectable()
    class DecoratedProviderClass {}
    @ElectronModule({
      providers: [DecoratedProviderClass],
    })
    class SubModuleClass {}

    @Injectable()
    class AnotherDecoratedProviderClass {}
    @ElectronModule({
      imports: [SubModuleClass],
      providers: [AnotherDecoratedProviderClass],
    })
    class ModuleClass {}

    expect(() => bootstrapResolveProviders(ModuleClass)).not.toThrow();
  });

  it('should NOT throw if provider properly configured with useClass providers', () => {
    @Injectable()
    class DecoratedProviderToBeOverriddenClass {}
    @Injectable()
    class DecoratedProviderWhichOverridesClass {}
    @ElectronModule({
      providers: [
        {
          provide: DecoratedProviderToBeOverriddenClass,
          useClass: DecoratedProviderWhichOverridesClass,
        },
      ],
    })
    class ModuleClass {}

    const overrideSpy = jest.spyOn(Injector, 'overrideToken');

    expect(() => bootstrapResolveProviders(ModuleClass)).not.toThrow();
    expect(overrideSpy).toHaveBeenCalledWith(
      DecoratedProviderToBeOverriddenClass,
      DecoratedProviderWhichOverridesClass,
    );
  });

  it('should NOT throw with providers that have dependencies', () => {
    @Injectable()
    class DecoratedDependencyClass {}
    @Injectable()
    class DecoratedWithDependenciesClass {
      constructor(private dependency: DecoratedDependencyClass) {}
    }
    @ElectronModule({
      providers: [DecoratedWithDependenciesClass],
    })
    class ModuleClass {}

    bootstrapResolveProviders(ModuleClass);

    expect(() => bootstrapResolveProviders(ModuleClass)).not.toThrow();
  });
});
