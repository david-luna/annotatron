/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
import { Injectable, Injector } from '../injectable';
import { Command, Event, Query } from './command-query-event';
import { ElectronModule } from './electron-module';
import { bootstrapModule } from './bootstrap-module';

@Injectable()
class DecoratedClass {
  @Command('my-command')
  commandHandler(): void {}
  @Query('my-query')
  queryHandler(): void {}
  @Event('my-event')
  eventHandler(): void {}
}

@Injectable()
class AnotherDecoratedClass {
  @Command('my-command')
  commandHandler(): void {}
  @Query('my-query')
  queryHandler(): void {}
  @Event('my-event')
  eventHandler(): void {}
}

class NonDecoratedClass {}

describe('The @ElectronModule decorator', () => {
  const ipcMainMock = { on: jest.fn() } as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if importing a non module class', () => {
    @ElectronModule({
      imports: [NonDecoratedClass],
      providers: [DecoratedClass],
    })
    class MisconfiguredModuleClass {}

    try {
      bootstrapModule(MisconfiguredModuleClass, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('is not a module');
      expect(ipcMainMock.on).not.toHaveBeenCalled();
    }

    expect.assertions(3);
  });

  it('should throw an error if a provider is not injectable', () => {
    @ElectronModule({
      providers: [NonDecoratedClass],
    })
    class BadProviderModuleClass {}

    try {
      bootstrapModule(BadProviderModuleClass, ipcMainMock);
    } catch (error) {
      expect(error instanceof Error).toEqual(true);
      expect(error.message).toContain('could not be found in the injector');
      expect(ipcMainMock.on).not.toHaveBeenCalled();
    }

    expect.assertions(3);
  });

  it('should do the bootstrap if modules properly configured', () => {
    @ElectronModule({
      providers: [DecoratedClass],
    })
    class SubModuleClass {}

    @ElectronModule({
      imports: [SubModuleClass],
      providers: [AnotherDecoratedClass],
    })
    class ModuleClass {}

    bootstrapModule(ModuleClass, ipcMainMock);

    expect(ipcMainMock.on).toHaveBeenCalledTimes(6);
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(1, 'annotatron:commands:my-command', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(2, 'annotatron:queries:my-query', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(3, 'annotatron:events:my-event', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(4, 'annotatron:commands:my-command', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(5, 'annotatron:queries:my-query', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(6, 'annotatron:events:my-event', expect.any(Function));
  });

  it('should connect provider methods to messages properly', async () => {
    @Injectable()
    class ProviderClass {
      @Command('a-command')
      commandHandler(): any {
        return { result: 'command-result' };
      }
      @Query('a-query')
      queryHandler(): any {
        return Promise.resolve({ result: 'query-result' });
      }
      @Event('a-event')
      eventHandler(): any {
        return { result: 'event-result' };
      }
    }

    @ElectronModule({
      providers: [ProviderClass],
    })
    class ModuleWithProviderClass {}

    const onMock = ipcMainMock.on as jest.SpyInstance;
    const senderMock = { send: jest.fn() } as any;
    const eventMock = { sender: senderMock } as any;
    const listeners = {} as any;

    onMock.mockImplementation((event, handler) => {
      const key = event.split(':')[1];
      listeners[key] = handler;
    });

    bootstrapModule(ModuleWithProviderClass, ipcMainMock);

    expect(ipcMainMock.on).toHaveBeenCalledTimes(3);
    expect(listeners.commands).toBeDefined();
    expect(listeners.queries).toBeDefined();
    expect(listeners.events).toBeDefined();

    listeners.commands(eventMock, [{ type: 'a-command', payload: {} }]);
    expect(senderMock.send).toHaveBeenCalledWith(
      'annotatron:results',
      expect.arrayContaining([expect.objectContaining({ result: 'command-result' })]),
    );

    listeners.queries(eventMock, [{ type: 'a-query', payload: {} }]);
    await Promise.resolve(); // wait to next tick
    expect(senderMock.send).toHaveBeenCalledWith(
      'annotatron:results',
      expect.arrayContaining([expect.objectContaining({ result: 'query-result' })]),
    );

    listeners.events(eventMock, [{ type: 'a-event', payload: {} }]);
    expect(senderMock.send).toHaveBeenCalledTimes(2);
  });
});
