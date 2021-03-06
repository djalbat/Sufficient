"use strict";

export default class Task  {
  constructor(method, ...remainingArguments) {
    const callback = remainingArguments.pop(); ///

    this.method = method;
    this.callback = callback;
    this.remainingArguments = remainingArguments;
  }

  getMethod() {
    return this.method;
  }

  getCallback() {
    return this.callback;
  }

  getRemainingArguments() {
    return this.remainingArguments;
  }

  execute(callback) {
    this.method.call(null, ...this.remainingArguments, callback);
  }
}
