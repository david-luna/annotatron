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

  it('should throw an error if importing a non decorated class', () => {
    class NonDecoratedModuleClass {}
    @ElectronModule({
      imports: [NonDecoratedModuleClass],
      providers: [],
    })
    class MisconfiguredModuleClassOne {}

    expect(() => bootstrapResolveProviders(MisconfiguredModuleClassOne)).toThrow('is not a module');
  });

  it('should throw an error if importing a wrongly decorated class', () => {
    @Injectable()
    class WronglyDecoratedModuleClass {}
    @ElectronModule({
      imports: [WronglyDecoratedModuleClass],
      providers: [],
    })
    class MisconfiguredModuleClassTwo {}

    expect(() => bootstrapResolveProviders(MisconfiguredModuleClassTwo)).toThrow('is not a module');
  });

  it('should throw an error if a regular provider is not injectable', () => {
    class NonDecoratedProviderClass {}
    @ElectronModule({
      providers: [NonDecoratedProviderClass],
    })
    class BadProviderModuleClass {}

    expect(() => bootstrapResolveProviders(BadProviderModuleClass)).toThrow('is not registered');
  });

  it('should throw an error if a useClass provider is not injectable', () => {
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

    expect(() => bootstrapResolveProviders(AnotherBadProviderModuleClass)).toThrow('is not registered');
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

    // eslint-disable-next-line prettier/prettier
    expect(bootstrapResolveProviders(ModuleClass)).toEqual([
      AnotherDecoratedProviderClass,
      DecoratedProviderClass,
    ]);
  });

  it('should throw if provider misconfigured with useClass providers', () => {
    @Injectable()
    class DecoratedProviderToBeOverriddenClass {}
    @Injectable()
    class DecoratedProviderWhichOverridesClass {}
    @Injectable()
    class DecoratedProviderWhichAlsoOverridesClass {}

    @ElectronModule({
      providers: [
        {
          provide: DecoratedProviderToBeOverriddenClass,
          useClass: DecoratedProviderWhichOverridesClass,
        },
      ],
    })
    class ModuleClassWithOverride {}

    @ElectronModule({
      imports: [ModuleClassWithOverride],
      providers: [
        {
          provide: DecoratedProviderToBeOverriddenClass,
          useClass: DecoratedProviderWhichAlsoOverridesClass,
        },
      ],
    })
    class ModuleClassImportingOverride {}

    expect(() => bootstrapResolveProviders(ModuleClassImportingOverride)).toThrow('is already overridden');
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

    expect(bootstrapResolveProviders(ModuleClass)).toEqual([
      {
        provide: DecoratedProviderToBeOverriddenClass,
        useClass: DecoratedProviderWhichOverridesClass,
      },
    ]);
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

    // eslint-disable-next-line prettier/prettier
    expect(bootstrapResolveProviders(ModuleClass)).toEqual([
      DecoratedWithDependenciesClass,
    ])
  });
});
