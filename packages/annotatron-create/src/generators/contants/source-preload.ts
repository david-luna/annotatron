export const sourcePreload = `
const { contextBridge, ipcRenderer } = require('electron');

const observableLike = (key) => {
  return {
    subscribe: (observer) => {
      const channel = 'annotatron:' + key;
      const ipcHandler = (evt, payload) => observer(payload);

      ipcRenderer.on(channel, ipcHandler);
      return {
        unsubscribe: function() {
          ipcRenderer.removeListener(channel, ipcHandler);
        }
      };
    }
  };
};

contextBridge.exposeInMainWorld(
  'mainProcess',
  {
    sendCommand: (command) => ipcRenderer.send('annotatron:commands', command),
    sendQuery  : (query)   => ipcRenderer.send('annotatron:queries' , query),
    results$   : observableLike('results'),
    errors$    : observableLike('errors'),
    events$    : observableLike('events'),
  }
);
`;
