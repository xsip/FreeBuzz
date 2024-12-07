declare global {
  interface Window {
    require: typeof require;
    monaco: any;
  }
}
