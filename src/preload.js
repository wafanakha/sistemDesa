import { contextBridge, ipcRenderer } from "electron";

const api: ElectronAPI = {
  printPDF: (pdfUrl) => ipcRenderer.invoke("print-pdf", pdfUrl),
  // other APIs
};

contextBridge.exposeInMainWorld("electron", api);
