/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable, Injector } from '../injectable';
import { Command, Event, Query } from './command-query-event';
import { ElectronModule } from './electron-module';
import { bootstrapModule, connectWindow, emitEvent } from './bootstrap-module';
import { BrowserWindow } from './electron-types';

describe('The @ElectronModule decorator', () => {
  const ipcMainMock = { on: jest.fn(), emit: jest.fn() } as any;
  const ipcMainOnSpy = ipcMainMock.on as jest.SpyInstance;

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
      bootstrapModule(MisconfiguredModuleClassOne, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not a module');
      expect(ipcMainOnSpy).not.toHaveBeenCalled();
    }

    @Injectable()
    class WronglyDecoratedModuleClass {}
    @ElectronModule({
      imports: [WronglyDecoratedModuleClass],
      providers: [],
    })
    class MisconfiguredModuleClassTwo {}

    try {
      bootstrapModule(MisconfiguredModuleClassTwo, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not a module');
      expect(ipcMainOnSpy).not.toHaveBeenCalled();
    }

    expect.assertions(6);
  });

  it('should throw an error if a provider is not injectable', () => {
    class NonDecoratedProviderClass {}
    @ElectronModule({
      providers: [NonDecoratedProviderClass],
    })
    class BadProviderModuleClass {}

    try {
      bootstrapModule(BadProviderModuleClass, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not registered');
      expect(ipcMainOnSpy).not.toHaveBeenCalled();
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
      bootstrapModule(AnotherBadProviderModuleClass, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not registered');
      expect(ipcMainOnSpy).not.toHaveBeenCalled();
    }

    expect.assertions(6);
  });

  it('should do the bootstrap if provider properly configured with injectable classes', () => {
    @Injectable()
    class DecoratedProviderClass {
      @Command('my-command')
      commandHandler(): any {}
      @Query('my-query')
      queryHandler(): any {}
      @Event('my-event')
      eventHandler(): any {}
    }
    @ElectronModule({
      providers: [DecoratedProviderClass],
    })
    class SubModuleClass {}

    @Injectable()
    class AnotherDecoratedProviderClass {
      @Command('my-command')
      commandHandler(): any {}
      @Query('my-query')
      queryHandler(): any {}
      @Event('my-event')
      eventHandler(): any {}
    }
    @ElectronModule({
      imports: [SubModuleClass],
      providers: [AnotherDecoratedProviderClass],
    })
    class ModuleClass {}

    bootstrapModule(ModuleClass, ipcMainMock);

    expect(ipcMainOnSpy).toHaveBeenCalledTimes(6);
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(1, 'annotatron:commands', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(2, 'annotatron:queries', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(3, 'annotatron:events', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(4, 'annotatron:commands', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(5, 'annotatron:queries', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(6, 'annotatron:events', expect.any(Function));
  });

  it('should do the bootstrap if provider properly configured with useClass providers', () => {
    @Injectable()
    class DecoratedProviderToBeOverriddenClass {}
    @Injectable()
    class DecoratedProviderWhichOverridesClass {
      @Command('my-command')
      commandHandler(): any {}
      @Query('my-query')
      queryHandler(): any {}
      @Event('my-event')
      eventHandler(): any {}
    }
    @ElectronModule({
      providers: [
        {
          provide: DecoratedProviderToBeOverriddenClass,
          useClass: DecoratedProviderWhichOverridesClass,
        },
      ],
    })
    class ModuleClass {}

    bootstrapModule(ModuleClass, ipcMainMock);

    expect(ipcMainOnSpy).toHaveBeenCalledTimes(3);
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(1, 'annotatron:commands', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(2, 'annotatron:queries', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(3, 'annotatron:events', expect.any(Function));
  });

  it('should do the bootstrap with providers that have dependencies', () => {
    @Injectable()
    class DecoratedDependencyClass {}
    @Injectable()
    class DecoratedWithDependenciesClass {
      constructor(private dependency: DecoratedDependencyClass) {}
      @Command('my-command')
      commandHandler(): any {}
      @Query('my-query')
      queryHandler(): any {}
      @Event('my-event')
      eventHandler(): any {}
    }
    @ElectronModule({
      providers: [DecoratedWithDependenciesClass],
    })
    class ModuleClass {}

    bootstrapModule(ModuleClass, ipcMainMock);

    expect(ipcMainOnSpy).toHaveBeenCalledTimes(3);
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(1, 'annotatron:commands', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(2, 'annotatron:queries', expect.any(Function));
    expect(ipcMainOnSpy).toHaveBeenNthCalledWith(3, 'annotatron:events', expect.any(Function));
  });

  it('should send result of the listener method of the provider as messages', async () => {
    @Injectable()
    class DecoratedProviderWithListenersClass {
      @Command('my-command')
      commandHandler(): any {
        return { result: 'command-result' };
      }
      @Query('my-query')
      queryHandler(): any {
        return Promise.resolve({ result: 'query-result' });
      }
      @Event('my-event')
      eventHandler(): any {
        return { result: 'event-result' };
      }
    }
    @ElectronModule({
      providers: [DecoratedProviderWithListenersClass],
    })
    class ModuleWithProviderClass {}

    const sendSpy = jest.fn();
    const senderMock = { send: sendSpy } as any;
    const eventMock = { sender: senderMock } as any;
    const listeners = {} as any;

    ipcMainOnSpy.mockImplementation((event, handler) => {
      const key = event.split(':')[1];
      listeners[key] = handler;
    });

    bootstrapModule(ModuleWithProviderClass, ipcMainMock);

    expect(ipcMainOnSpy).toHaveBeenCalledTimes(3);
    expect(listeners.commands).toBeDefined();
    expect(listeners.queries).toBeDefined();
    expect(listeners.events).toBeDefined();

    listeners.commands(eventMock, { type: 'mismatch-command', payload: {} });
    listeners.queries(eventMock, { type: 'mismatch-query', payload: {} });
    listeners.events({ type: 'mismatch-event', payload: {} });
    expect(sendSpy).not.toHaveBeenCalled();

    listeners.commands(eventMock, { type: 'my-command', payload: {} });
    await Promise.resolve(); // wait to next tick
    // eslint-disable-next-line prettier/prettier
    expect(sendSpy).toHaveBeenCalledWith(
      'annotatron:results',
      expect.objectContaining({ result: 'command-result' }),
    );

    listeners.queries(eventMock, { type: 'my-query', payload: {} });
    await Promise.resolve(); // wait to next tick
    // eslint-disable-next-line prettier/prettier
    expect(sendSpy).toHaveBeenCalledWith(
      'annotatron:results',
      expect.objectContaining({ result: 'query-result' }),
    );

    listeners.events({ type: 'my-event', payload: {} });
    expect(sendSpy).toHaveBeenCalledTimes(2);
  });

  describe('connectWindow and emitEvent', () => {
    @ElectronModule({
      imports: [],
      providers: [],
    })
    class ModuleClass {}

    const windowMock = ({ on: jest.fn(), webContents: { send: jest.fn() } } as unknown) as BrowserWindow;
    const onSpy = (windowMock.on as unknown) as jest.SpyInstance;
    const sendSpy = (windowMock.webContents.send as unknown) as jest.SpyInstance;
    const ipcMainEmitSpy = (ipcMainMock.emit as unknown) as jest.SpyInstance;

    it('should keep a window reference and emit events on it', () => {
      const eventData = { type: 'event-type', payload: 'test' };
      let closeCallback: () => void;
      onSpy.mockImplementation((name, callback) => (closeCallback = callback));

      bootstrapModule(ModuleClass, ipcMainMock);
      connectWindow(windowMock);
      emitEvent(eventData);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      closeCallback!();

      emitEvent(eventData);

      expect(ipcMainEmitSpy).toHaveBeenCalledWith('annotatron:events', eventData);
      expect(sendSpy).toHaveBeenCalledWith('annotatron:events', eventData);
      expect(ipcMainEmitSpy).toHaveBeenCalledTimes(2);
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });
});
