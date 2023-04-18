/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable } from 'injection-js';
import { ElectronModule } from './electron-module';
import { bootstrapResolveProviders } from './bootstrap-resolve-providers';

@Injectable()
class ProviderClass {}

@Injectable()
class ProviderClassForReplacement {}

@Injectable()
class ProviderDependencyClass {}

@Injectable()
class ProviderClassWithDependency {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(dependency: ProviderDependencyClass) {}
}

class NonDecoratedProviderClass {}
class NonDecoratedProviderClassWithDependency {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor(secretDependency: unknown) {}
}

// Electron decorators
class NonDecoratedModuleClass {}

@ElectronModule({
  imports: [NonDecoratedModuleClass],
  providers: [],
})
class ModuleClassWithNonDecoratedImports {}

@ElectronModule({
  providers: [ProviderClass],
})
class ModuleClassOnlyWithProviders {}

@ElectronModule({
  providers: [NonDecoratedProviderClass],
})
class ModuleClassOnlyWithNonDecoratedProvider {}

@ElectronModule({
  providers: [NonDecoratedProviderClassWithDependency],
})
class ModuleClassWithNonDecoratedProviderDependency {}

@ElectronModule({
  providers: [{ provide: ProviderClass, useClass: ProviderClassForReplacement }],
})
class ModuleClassWithUseClassProvider {}

@ElectronModule({
  providers: [
    ProviderClassForReplacement,
    {
      provide: ProviderClass,
      useFactory: (replacement: ProviderClassForReplacement) => replacement,
      deps: [ProviderClassForReplacement],
    },
  ],
})
class ModuleClassWithUseFactoryProvider {}

@ElectronModule({
  imports: [ModuleClassOnlyWithProviders],
  providers: [ProviderDependencyClass, ProviderClassWithDependency],
})
class ModuleClassOnlyWithProvidersAndImports {}

describe('bootstrapResolveProviders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if is not a module', () => {
    expect(() => bootstrapResolveProviders(NonDecoratedModuleClass)).toThrow('is not a module');
  });

  it('should throw an error if importing a non decorated module class', () => {
    expect(() => bootstrapResolveProviders(ModuleClassWithNonDecoratedImports)).toThrow('is not a module');
  });

  it('should work if module has providers in direct form', () => {
    const instances = bootstrapResolveProviders(ModuleClassOnlyWithProviders);

    expect(instances.length).toEqual(1);
    expect(instances[0]).toBeInstanceOf(ProviderClass);
  });

  it('should work if module has non decorated providers with no dependencies', () => {
    const instances = bootstrapResolveProviders(ModuleClassOnlyWithNonDecoratedProvider);

    expect(instances.length).toEqual(1);
    expect(instances[0]).toBeInstanceOf(NonDecoratedProviderClass);
  });

  it('should throw an error if module has non decorated providers with dependencies', () => {
    expect(() => bootstrapResolveProviders(ModuleClassWithNonDecoratedProviderDependency)).toThrow(
      'Cannot resolve all parameters',
    );
  });

  it('should work if module has providers with useClass', () => {
    const instances = bootstrapResolveProviders(ModuleClassWithUseClassProvider);

    expect(instances.length).toEqual(1);
    expect(instances[0]).toBeInstanceOf(ProviderClassForReplacement);
  });

  it('should work if module has providers with useFactory', () => {
    const classes = [ProviderClass, ProviderClassForReplacement];
    const instances = bootstrapResolveProviders(ModuleClassWithUseFactoryProvider);

    instances.forEach((i) => {
      expect(classes.find((c) => i instanceof c)).toBeTruthy();
    });
    expect(instances.length).toEqual(classes.length);
  });

  it('should work if module has providers and good imports', () => {
    const classes = [ProviderClass, ProviderClassWithDependency, ProviderDependencyClass];
    const instances = bootstrapResolveProviders(ModuleClassOnlyWithProvidersAndImports);

    instances.forEach((i) => {
      expect(classes.find((c) => i instanceof c)).toBeTruthy();
    });
    expect(instances.length).toEqual(classes.length);
  });
});
