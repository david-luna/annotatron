/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import { Injectable } from '../injectable';
import { Command, Event, Query } from './command-query-event';
import { ElectronApplication } from './electron-application';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockIpcMain = { on: jest.fn() } as any;

@Injectable()
class TestClass {
  @Command('my-command')
  commandHandler(): void {}
  @Query('my-query')
  queryHandler(): void {}
  @Event('my-event')
  eventHandler(): void {}
}

describe('The @ElectronApplication decorator', () => {
  it('should add metadata on which commands the class accepts', () => {
    @ElectronApplication({
      ipcMain: mockIpcMain,
    })
    class ApplicationToTest {
      constructor(private test: TestClass) {}
    }

    expect(mockIpcMain.on).toHaveBeenCalledTimes(3);
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(1, 'commands:my-command', expect.any(Function));
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(2, 'queries:my-query', expect.any(Function));
    expect(mockIpcMain.on).toHaveBeenNthCalledWith(3, 'events:my-event', expect.any(Function));
  });
});
