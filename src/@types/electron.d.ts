// src/@types/electron.d.ts
interface ElectronAPI {
  printPDF: (pdfUrl: string) => Promise<void>;
  // Add other Electron APIs you need
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
