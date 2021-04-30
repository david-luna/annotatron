# annotatron

Set of helper annotations for electron projects.

## Usage


### Application setup

Create a new class and decorate with @ElectronApplication. That class must have a static method called `createWindow` which should be used to create browser windows. All browser windows create with this method will be capable to communicate with the main process.

```typescript
// file: my-electron-application.ts
import * as electron from 'electron';
import { ElectronApplication } from 'annotatron';
import { MyProvider } from './path/to/my-provider.ts';

@ElectronApplication({
  electron: electronMock,
  providers: [MyProvider],
})
export class MyElectronApplication {
  static createWindow(options: electron.BrowserWindowOptions): electron.BrowserWindow {
    return new electron.BrowserWindow(options);
  }
}
```

### Listening in the main process

Providers are classes that will be injected into the application and will listen to messages from browser windows and other providers. A provider can listen to Commands, Queries adn Events using the right decorators.

```typescript
// file: my-provider.ts
import { Injectable, Command, Query, Event } from 'annotatron';

@Injectable()
export class MyProvider {
  @Command('my-command')
  commandHandler(command: any): any {
    // do something with the command and depending on th return value:
    // - if a truthy value is returned is going to be emitted as a command result
    // - if a promise is returned is going to emit its resolved value as a command result
    // - if there is an exception or a rejected promise is going to emit the error/rejected value as a command error
  }
  @Query('my-query')
  queryHandler(query: any): any {
    // do something with the query and depending on th return value:
    // - if a truthy value is returned is going to be emitted as a query result
    // - if a promise is returned is going to emit its resolved value as a query result
    // - if there is an exception or a rejected promise is going to emit the error/rejected value as a query error
  }
  @Event('my-event')
  eventHandler(event: any): void {
    // handle the event. it does nothing with the result value
  }
}
```

### Emitting events

Whenever you want to emit an event to let other components know that something happened you may use the `emitEvent` method. This will broadcast to the main process and all the windows created via the static method `createWindow` mentioned above.

```typescript
// file: my-class.ts
import { emitEvent } from 'annotatron';

// There is no need to be in an injectable class
export class MyClass {
  method(command: any): any {
    const data = some_logic();

    emitEvent(data);
  }
}
```

### Emitting commands ad queries from a window

Commands and Queries are meant to be fired from browser windows to the main process. Also this lib is meant to work with windows with [context isolation](https://www.electronjs.org/docs/tutorial/context-isolation) enabled and with the [remote module](https://www.electronjs.org/docs/api/remote) disabled. Therefore you must provide a preload script to create a communication bridge.

- Commands must be sent to the ipcMain process using `annotation:commands` channel.
- Command results are sent back to the ipcRender through the `annotation:commands:results` channel.
- Command errors are sent back to the ipcRender through the `annotation:commands:errors` channel.
- Queries must be sent to the ipcMain process using `annotation:queries` channel.
- Query results are sent back to the ipcRender through the `annotation:queries:results` channel.
- Query errors are sent back to the ipcRender through the `annotation:queries:errors` channel.
- Events are sent to browser windows through the `annotation:events` channel.

A sample preload script could be:

```javascript
// file: preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'mainProcess',
  {
    sendCommand: (command) => ipcRenderer.send(`annotatron:commands`, [command]),
    sendQuery: (query) => ipcRenderer.send(`annotatron:queries`, [query]),
    results$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);

        ipcRenderer.on(`commands:results`, ipcHandler);
        ipcRenderer.on(`queries:results`, ipcHandler);
        return {
          unsubscribe: function() {
            ipcRenderer.removeListener(`commands:results`, ipcHandler);
            ipcRenderer.removeListener(`queries:results`, ipcHandler);
          }
        };
      }
    },
    errors$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);

        ipcRenderer.on(`commands:errors`, ipcHandler);
        ipcRenderer.on(`queries:errors`, ipcHandler);
        return {
          unsubscribe: function() {
            ipcRenderer.removeListener(`commands:errors`, ipcHandler);
            ipcRenderer.removeListener(`queries:errors`, ipcHandler);
          }
        };
      }
    }
    events$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);

        ipcRenderer.on(`events`, ipcHandler);

        return {
          unsubscribe: function() {
            ipcRenderer.removeListener(`events`, ipcHandler);
          }
        };
      }
    }
  }
);
```
