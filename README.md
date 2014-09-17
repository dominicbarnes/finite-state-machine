finite-state-machine
====================

Turns your object/class into a
[Finite State Machine](http://en.wikipedia.org/wiki/Finite-state_machine).
A lot of inspiration was taken from
[machina.js](https://github.com/ifandelse/machina.js)
when designing the API.


## Installation

```bash
component install dominicbarnes/finite-state-machine
```


## Usage

This is a mixin, and is used similarly to
[component/emitter](https://github.com/component/emitter)
but it additionally exposes a fluent (chainable) API for adding states
and handlers to your state machine.

We will build a state machine reflecting this great example from
[wikipedia](http://en.wikipedia.org/wiki/Finite-state_machine#Example:_a_turnstile)

![example state machine](http://upload.wikimedia.org/wikipedia/commons/9/9e/Turnstile_state_machine_colored.svg)


```js
var FSM = require("finite-state-machine");

function Turnstyle() {
    this.start();
}

FSM(Turnstyle.prototype)
    .state("locked")
        .on("push", "locked")
        .on("coin", "unlocked")
    .state("unlocked")
        .on("push", "locked")
        .on("coin", "unlocked");

var ts = new Turnstyle();
ts.currentState(); // "locked"
ts.handle("push");
ts.currentState(); // "locked"
ts.handle("coin");
ts.currentState(); // "unlocked"
ts.handle("push");
ts.currentState(); // "locked"
```

If a function is used, you can perform more complex branching. You must remember
to call `transition` yourself however. In handlers, `this` is the root machine
object.

```js
FSM(Turnstyle.prototype)
    .state("locked")
        .on("coin", function () {
            console.log("thank you, you may now pass!");
            this.transition("unlocked");
        })
        .on("push", function () {
            console.log("locked, please enter a coin to proceed");
        });
```


This means you can create classes that are state machines, and all instances
you create are **different** state machines, each with their own state.

Each state can also be given special handlers for entry/exit. These will be
called upon automatically during a state transition.

```js
FSM(Turnstyle.prototype)
    .state("unlocked")
        .enter(function () {
            console.log("unlocked!");
        })
        .exit(function () {
            console.log("locked!");
        });

var ts = new Turnstyle();
ts.currentState(); // "locked"
ts.handle("coin"); // $ "unlocked!"
ts.handle("push"); // $ "locked!"
```

When `handle` is called with an unknown event, it simply does nothing.


## API

### Configuration

This is the fluent API you use to configure your state machines.

#### Machine#state(name)

Adds a new state to the state machine. Until the next call to `state`, this is
assumed to be the target of methods like `on`, `enter` and `exit`.

#### Machine#on(event, fn)

Adds a new event handler for active state. `event` must be a `String`. If `fn`
is a `String`, it will transition to the state with that same name when called
upon.

#### Machine#enter(fn)

Adds a entry handler for active state. `fn` must be a function.

#### Machine#exit(fn)

Adds a entry handler for active state. `fn` must be a function.

#### Machine#initialState()

Sets the starting state for your machine. The first state created via
`Machine#state(name)` is assumed to be the initial state. (so this is likely
unnecessary most of the time)


### Lifecycle

These methods are meant to be used throughout the life of your state machine.

#### Machine#start()

This transitions the state machine into the "initial state", usually this goes
in your constructor directly. But you can call it at other times depending on
your use-case.

#### Machine#handle(event, ...args)

Triggers the given `event` using the current state to determine what actions
to take. All the additional arguments are forwarded to the handler functions.

#### Machine#transition(state)

Causes the machine to transition to the given `state`. The current state's exit
handler will be called. (now it becomes the previous state) Afterwards, the
new current state's entry handler will be called.

#### Machine#currentState()

Retrieves the name of the current state this machine is in.

#### Machine#previousState()

Retrieves the name of the last state this machine is in.
