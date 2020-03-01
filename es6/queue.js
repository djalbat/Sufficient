'use strict';

const necessary = require('necessary');

const { arrayUtilities } = necessary,
      { first } = arrayUtilities;

class Queue {
  constructor(tasks) {
    this.tasks = tasks;
  }

  addTask(task) {
    const empty = this.isEmpty();

    this.tasks.push(task);

    if (empty) {
      this.executeNextTask();
    }
  }

  executeNextTask() {
    const firstTask = first(this.tasks),
          nextTask = firstTask, ///
          nextTaskSynchronous = nextTask.isSynchronous();
    
    if (nextTaskSynchronous) { ///
      const synchronousTask = nextTask;  ///

      this.executeSynchronousTask(synchronousTask);
    } else {
      const asynchronousTask = nextTask;  ///

      this.executeAsynchronousTask(asynchronousTask);
    }
  }

  executeSynchronousTask(synchronousTask) {
    synchronousTask.execute();

    this.next();
  }

  executeAsynchronousTask(asynchronousTask) {
    const next = this.next.bind(this);

    asynchronousTask.execute(function() {
      const callback = asynchronousTask.getCallback();
      
      callback.apply(asynchronousTask, arguments);
      
      next();
    });
  }

  next() {
    this.tasks.shift();

    const empty = this.isEmpty();

    if (!empty) {
      this.executeNextTask();
    }
  }

  isEmpty() {
    const tasksLength = this.tasks.length,
          empty = (tasksLength === 0);

    return empty;
  }

  static fromNothing() {
    const tasks = [],
          queue = new Queue(tasks);

    return queue;
  }
}

module.exports = Queue;
