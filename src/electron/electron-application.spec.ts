/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-classes-per-file */
import { Injectable } from '../injectable';
import { Command, Event, Query } from './command-query-event';
import { ElectronApplication } from './electron-application';

const ipcMainMock = { on: jest.fn() } as any;
const browserWindowMock = jest.fn();
const electronMock = { browserWindow: browserWindowMock, ipcMain: ipcMainMock } as any;

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
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should throw if the class does not have a static method name createWindow', () => {
    try {
      @ElectronApplication({
        electron: electronMock,
        providers: [TestClass],
      })
      class ApplicationWithoutStaticMethod {}
    } catch (error) {
      expect(error instanceof TypeError).toEqual(true);
      expect(error.message).toContain('must have a static method');
    }

    expect.assertions(2);
  });

  it('should add metadata on which commands the class accepts', () => {
    @ElectronApplication({
      electron: electronMock,
      providers: [TestClass],
    })
    class ApplicationToTest {
      static createWindow(): any {}
    }

    expect(ipcMainMock.on).toHaveBeenCalledTimes(3);
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(1, 'annotatron:commands:my-command', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(2, 'annotatron:queries:my-query', expect.any(Function));
    expect(ipcMainMock.on).toHaveBeenNthCalledWith(3, 'annotatron:events:my-event', expect.any(Function));
  });
});
