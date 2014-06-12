finite-state-machine
====================

Turns your object/class into a [Finite State Machine](http://en.wikipedia.org/wiki/Finite-state_machine).
A lot of inspiration was taken from [machina.js](https://github.com/ifandelse/machina.js) when designing
the API.


## Installation

```bash
component install dominicbarnes/finite-state-machine
```


## Usage

There are many ways to initialize, but the examples here will only cover the most common use-case,
working with constructor functions and prototypes. (eg: "classes")

```js
var FSM = require("finite-state-machine");

function MyClass() {
    this.start();
}

FSM(MyClass.prototype)
    .state("A")
        .on("enter", function () {
            console.log("Entering A");
        })
        .on("next", "B")
    .state("B")
        .on("exit", function () {
            console.log("Exiting B");
        })
        .on("previous", "A");


var instance = new MyClass();
instance.handle("next");     // transitions to state "B"
instance.handle("next");     // does nothing, state "B" has no "next" event handler
instance.handle("previous"); // transitions to state "A"
```

## API

The object returned by `FSM(MyClass.prototype)` is a fluent/chainable API for configuring the
states and transitions. I've separated the `Machine` and `State` methods below and have labeled
them accordingly.


### Machine#state(name)

Creates a new `State` object, associates it with this state machine and returns it. The returned
value is **not** the original state machine object, so be careful with what you assign to variables.

Each `State` object is an [`Emitter`](https://github.com/component/emitter) instance, so it inherits
all of it's methods. There is 1 big exception, and that is that `State#on()` has been overloaded just
for FSM. (see docs for more information)

If called multiple times with the same `name`, the preivously-created `State` object will be
returned. (allowing configuration on the same state object at different times)

```js
FSM(MyClass.prototype)
    .state("A")
    .state("B")
    .state("C")
    .state("A") // this will be the same State object created above
```


### Machine#getState(name)

Returns the `State` object with the corresponding `name`. It will throw a `RangeError`
if it does not find one. (as opposed to `Machine#state()`, which will create new `State` objects)

**NOTE** This will likely become a private API in the future.


### Machine#initialState(name)

Sets the default/initial state for the machine. (this will be transitioned to when `Machine#start()`
is called)

If not specified, the first `State` object created via `Machine#state()` is assumed to be the
initial state.

When using this particular API in the midst of the fluent/chainable API, it must come **before**
the calls to `Machine#state()`. For example:

```js
FSM(MyClass.prototype)
    .initialState("B")
    .state("A") // without the initialState call, this is assumed to be the initial state
    .state("B")
    .state("C");
```


### Machine#handle(event, ...args)

Transitions between states are accomplished via event handlers. Usually, this will be called by
your application in response to user interaction, like `click`.

The handlers will have the source machine object as `this`, giving you the scope you are likely
expecting. If the handler specified via `State#on()` is a `String`, it will simply transition to
that state. If a `Function` is supplied, it will be responsible for calling `Machine#transition()`
itself.

```js
function MyClass(el) {
    this.element = el;
}

FSM(MyClass.prototype)
    .state("A")
        .on("click", "B")
    .state("B")
        .on("click", function (e) {
            this.transition("A");
        });


var fsm = new MyClass(document.getElementById("#my-button"));

fsm.element.onclick = function (e) {
    fsm.handle("click", e)
};
```


### Machine#transition(name)

Transitions from the current state to the state specified by `name`. In most cases, this should
only be called internally, such as via event handlers.


### Machine#start()

Starts the state machine and transitions to the initial state.

This was made a separate method in order to make lifecycle management a little easier.


### Machine#stop()

Stops the machine regandless of the state it is currently in.

This was made a separate method in order to make lifecycle management a little easier.


### State(machine, name)

Requires a reference to the parent `machine` and needs an identifier. (ie: `name`) This is
a **private** API, it's only documented here for completeness.


### State#on(event, fn)

Overloads the behavior of `Emitter#on()`.

If `fn` is a `String`, it will tranition to the state with a matching name.

If `fn` is a `Function`, it will be invoked when that event is emitted, and will be responsible for
updating the state machine. (ie: calling `Machine#transition()`) The context (ie: `this`) will be set
as the parent `Machine` object, not the `State` object. (because that wouldn't be useful or expected)


### State#state(name)

This method is **only** to support proper chaining, it is documented here in order to make that clear.

It will call `Machine#state()` on the parent machine object and return the result, allowing the chain
to continue despite being a `State` object rather than the `Machine` itself.
