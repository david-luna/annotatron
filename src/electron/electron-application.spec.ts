import { Injectable } from '../injectable';
import { Command, Event, Query } from './command-query-event';
import { ElectronApplication } from './electron-application';

const mockIpcMain = { on: jest.fn() } as any;

@Injectable()
class TestClass {
  @Command('my-command')
  commandHandler(): void { console.log('implementations'); }
  @Query('my-query')
  queryHandler(): void { console.log('implementations'); }
  @Event('my-event')
  eventHandler(): void { console.log('implementations'); }
}

describe('The @ElectronApplication decorator', () => {
  it('should add metadata on which commands the class accepts', () => {
    @ElectronApplication({
      ipcMain: mockIpcMain,
    })
    class ApplicationToTest {
      constructor(private test: TestClass) { }
    }

    expect(mockIpcMain.on).toHaveBeenCalledTimes(3);
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(1, 'commands:my-command', expect.any(Function));
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(2, 'queries:my-query', expect.any(Function));
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(3, 'events:my-event', expect.any(Function));
  });
});
