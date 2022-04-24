export class Logger {
  fileName = "";
  isEnabled = true;

  constructor(file) {
    this.fileName = `${file} >>`;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  logConsole(...args) {
    if (!this.isEnabled) {
      return;
    }
    console.log(this.fileName, ...args);
  }

  logWarn(...args) {
    if (!this.isEnabled) {
      return;
    }
    console.warn(this.fileName, ...args);
  }

  logError(...args) {
    if (!this.isEnabled) {
      return;
    }
    console.error(this.fileName, ...args);
  }

  logInfo(...args) {
    if (!this.isEnabled) {
      return;
    }
    console.info(this.fileName, ...args);
  }
}
