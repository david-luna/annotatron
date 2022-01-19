// CWD
export const cwd = process.cwd();

// Preload script
export const preloadTemplate = `
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'backend',
  {
    dispatchCommand: (command) => ipcRenderer.send('annotatron:commands', command),
    dispatchQuery: (query) => ipcRenderer.send('annotatron:queries', query),
    results$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);

        ipcRenderer.on('annotatron:results', ipcHandler);

        return {
          unsubscribe: function() {
            ipcRenderer.removeListener('annotatron:results', ipcHandler);
          }
        };
      }
    },
    errors$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);
  
        ipcRenderer.on('annotatron:errors', ipcHandler);
        
        return {
          unsubscribe: function() {
            ipcRenderer.removeListener('annotatron:errors', ipcHandler);
          }
        };
      }
    },
    events$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);
  
        ipcRenderer.on('annotatron:events', ipcHandler);
  
        return {
          unsubscribe: function() {
            ipcRenderer.removeListener('annotatron:events', ipcHandler);
          }
        };
      }
    },
    messages$: {
      subscribe: (observer) => {
        const ipcHandler = (evt, payload) => observer(payload);
  
        ipcRenderer.on('annotatron:results', ipcHandler);
        ipcRenderer.on('annotatron:errors', ipcHandler);
        ipcRenderer.on('annotatron:events', ipcHandler);
  
        return {
          unsubscribe: function() {
            ipcRenderer.removeListener('annotatron:results', ipcHandler);
            ipcRenderer.removeListener('annotatron:errors', ipcHandler);
            ipcRenderer.removeListener('annotatron:events', ipcHandler);
          }
        };
      }
    }
  }
);
`;
