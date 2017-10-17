# Sufficient

An MVC framework with scheduling.

This framework came into being as a result of [Juxtapose](https://github.com/djalbat/Juxtapose), which provides the means to create an application's view. The corresponding model will always be bespoke, so to speak, so there are no means to create it either here or in Juxtapose. That leaves the controller, which is implemented here. The reason that Sufficient is called an MVC framework is that the more or less prescriptive guidelines for putting an application together using these approaches are spelled out in what follows.
 
To gain an idea of how to put an application together using Sufficient and Juxtapose, it is a very good idea to watch the last few videos in the [The Joy of JSX](https://vimeo.com/album/4562013) series that went with Juxtapose, especially the last video, [10 Traditional MVC](https://vimeo.com/album/4562013/video/227405572). This video describes an MVC example application which you should probably get up and running yourself. Its [controller](https://github.com/djalbat/Juxtapose/blob/master/es6/examples/mvcApp/controller.js) is identical to the one here, in fact, aside from the lack of a reference to a scheduler. In what follows it is tacitly assumed that you have more than a passing familiarity with this material. 

In summary, all that is to be found here is a [scheduler](https://github.com/djalbat/Sufficient/blob/master/es6/scheduler.js) and a modified [controller](https://github.com/djalbat/Sufficient/blob/master/es6/controller.js), together with some patterns and guidelines which you should follow in order to put it all together. The scheduler will be needed if you want to write an application that encompasses asynchronous behaviour such as accessing the file system, or has concurrent functionality.  

## Installation

You can install Sufficient with [npm](https://www.npmjs.com/):

    npm install sufficient

You can also clone the repository with [Git](https://git-scm.com/)...

    git clone https://github.com/djalbat/Sufficient.git

...and then install the sufficient modules with npm from within the project's root directory:

    npm install

## Usage

If you are building with [Node.js](http://nodejs.org) the usage is as follows:

```js
const sufficient = require('sufficient'),
      { Scheduler, controller } = sufficient;
```

## Compiling from source

Automation is done with [npm scripts](https://docs.npmjs.com/misc/scripts), have a look at the `package.json` file. The pertinent commands are:

    npm run build-debug
    npm run watch-debug
    
## Main application architecture

The basic idea is to create the view and model and to pass references to these, together with references to a scheduler and a method to make use of them all, to the `assignMethods()` method of the `controller` singleton. Only once methods have been assigned to the controller is the view attached to the browser's DOM:  
    
```js
const scheduler = new Scheduler(),
      model = new Model(),
      view = <View />;

controller.assignMethods(createMethods, scheduler, model, view);

const body = new Body();

body.prepend(view);
```
    
## Invoking controller methods

Aside from being required above, the controller should only be required, and therefore its methods only invoked, from view classes. And from within these classes controller methods should only be referenced at runtime and not compile time, so to speak. Remember that they are assigned dynamically after the view has been created and will therefore not be available until after this happens. For example, the following will work because the `controller.resetPassword()` method is called from within the body of the `clickHandler()` method:

```js
class ResetPasswordButton extends Element {
  clickHandler() {
    controller.resetPassword();
  }
  
  ...

  initialise() {
    this.onClick(this.clickHandler);
  }
  
  ...
}
```

On the other hand, the direct assignment `this.onClick(controller.resetPassword)` would not work.

## Creating tasks

It is the job of controller methods to be available to the view as well as to create the tasks that manage the relationship between model and view or to carry out any other application functionality. Closure gives them access to the scheduler, the model and the view, with the aforementioned functionality typically being implemented by helper methods:

```js
const sufficient = require('sufficient');

const setPasswordHelper = require('./helper/setPassword'),
      resetPasswordHelper = require('./helper/resetPassword');

const { SynchronousTask, AsynchronousTask } = sufficient;

function createMethods(scheduler, model, view) {
  function setPassword(password) {
    const setPasswordAsynchronousTask = new AsynchronousTask(setPasswordHelper, model, view, done);

    scheduler.addTaskToQueue(setPasswordAsynchronousTask);
  }

  function resetPassword() {
    const resetPasswordSynchronousTask = new SynchronousTask(resetPasswordHelper, model, view);

    scheduler.addTaskToQueue(resetPasswordSynchronousTask);
  }

  return ({
    setPassword: setPassword,
    resetPassword: resetPassword
  });
}
```

Alternatively, the `SynchronousTask` and `AsynchronousTask` classes can be sub-classed, with the helper methods now effectively becoming private methods that reside in the files that contain the class definitions: 

```js
const SetPasswordAsynchronousTask = require('./task/asynchronous/setPassword'),
      ResetPasswordSynchronousTask = require('./task/synchronous/resetPassword');

function createMethods(scheduler, model, view) {
  function setPassword(password) {
    const setPasswordAsynchronousTask = new SetPasswordAsynchronousTask(model, view, done);

    scheduler.addTaskToQueue(setPasswordAsynchronousTask);
  }

  function resetPassword() {
    const resetPasswordSynchronousTask = ResetPasswordSynchronousTask(model, view);

    scheduler.addTaskToQueue(resetPasswordSynchronousTask);
  }

  return ({
    setPassword: setPassword,
    resetPassword: resetPassword
  });
}
```

The task class definitions are as follows:

```js
const sufficient = require('sufficient');

const { AsynchronousTask } = sufficient;

class SetPasswordAsynchronousTask extends AsynchronousTask {
  constructor(model, view, done) {
    super(setPassword, model, view, done);
  }
}

module.exports = SetPasswordAsynchronousTask;

function setPassword(model, view, done) {
    ...
    
    done();
}
```

```js
const sufficient = require('sufficient');

const { SynchronousTask } = sufficient;

class ResetPasswordSynchronousTask extends SynchronousTask {
  constructor(model, view) {
    super(resetPassword, model, view);
  }
}

module.exports = ResetPasswordSynchronousTask;

function resetPassword(model, view) {
    ....
}
```

In the case of asynchronous tasks the scheduler will pass its own intermediate callback to the corresponding method in order to give itself the opportunity to remove the task from its queue. It will then invoke the given callback method, which must be the last argument passed to the constructor, passing on the arguments. In the synchronous case, tasks are removed from the queue immediately after their corresponding methods have been invoked.

The tasks and scheduler are also agnostic to the method arguments. In the above examples the references to the model and view have been utilised but any number of arguments can be passed to the task constructors. A look at the [SynchronousTask](https://github.com/djalbat/Sufficient/blob/master/es6/task/synchronous.js) and [AsynchronousTask](https://github.com/djalbat/Sufficient/blob/master/es6/task/asynchronous.js) classes should convince.

## Contact

- james.smith@djalbat.com
- http://djalbat.com
