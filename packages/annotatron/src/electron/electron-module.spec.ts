/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable } from 'injection-js';
import { Command, Event, Query } from './command-query-event';
import { ElectronModule, MODULE_METADATA_KEY, MODULE_IMPORTS_KEY, MODULE_PROVIDERS_KEY } from './electron-module';

@Injectable()
class TestClass {
  @Command('my-command')
  commandHandler(): void {}
  @Query('my-query')
  queryHandler(): void {}
  @Event('my-event')
  eventHandler(): void {}
}

describe('The @ElectronModule decorator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set the proper metadata into the module class', () => {
    @ElectronModule({
      providers: [TestClass],
    })
    class SubModuleClass {}

    expect(Reflect.getMetadata(MODULE_METADATA_KEY, SubModuleClass)).toEqual(true);
    expect(Reflect.getMetadata(MODULE_PROVIDERS_KEY, SubModuleClass)).toEqual([TestClass]);
    expect(Reflect.getMetadata(MODULE_IMPORTS_KEY, SubModuleClass)).toEqual([]);

    @ElectronModule({
      imports: [SubModuleClass],
      providers: [TestClass],
    })
    class ModuleClass {}

    expect(Reflect.getMetadata(MODULE_METADATA_KEY, ModuleClass)).toEqual(true);
    expect(Reflect.getMetadata(MODULE_PROVIDERS_KEY, ModuleClass)).toEqual([TestClass]);
    expect(Reflect.getMetadata(MODULE_IMPORTS_KEY, ModuleClass)).toEqual([SubModuleClass]);
  });
});
