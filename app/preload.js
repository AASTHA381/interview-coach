const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('coach', {
  init: () => ipcRenderer.invoke('app:init'),
  saveSettings: (input) => ipcRenderer.invoke('settings:save', input),
  clearKey: (provider) => ipcRenderer.invoke('settings:clearKey', provider),
  testKey: (input) => ipcRenderer.invoke('settings:test', input),
  send: (text) => ipcRenderer.invoke('chat:send', text),
  stop: () => ipcRenderer.invoke('chat:stop'),
  newChat: () => ipcRenderer.invoke('chat:new'),
  docsList: () => ipcRenderer.invoke('docs:list'),
  docsPick: () => ipcRenderer.invoke('docs:pick'),
  docsSave: (input) => ipcRenderer.invoke('docs:save', input),
  docsRemove: (input) => ipcRenderer.invoke('docs:remove', input),
  stateInfo: () => ipcRenderer.invoke('state:info'),
  revealState: () => ipcRenderer.invoke('state:reveal'),
  exportState: () => ipcRenderer.invoke('state:export'),
  resetState: () => ipcRenderer.invoke('state:reset'),
  onDelta: (cb) => ipcRenderer.on('chat:delta', (_e, payload) => cb(payload)),
});
