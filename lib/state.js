// dependencies
var Emitter = require("emitter");


// single export
module.exports = State;


function State(machine, name) {
    this.machine = machine;
    this.name = name;
}

// mixins
Emitter(State.prototype);


// need to proxy handler context to the machine itself, not the state objects
State.prototype.on = function (event, fn) {
    var cb = typeof fn === "string"
        ? this.machine.transition.bind(this.machine, fn)
        : fn.bind(this.machine);

    // hack to work around how Emitter handles calls to .once
    // need to make sure not to clobber the wrapper function
    if (fn.fn) {
        fn.fn = cb;
    } else {
        fn = cb;
    }

    return Emitter.prototype.on.call(this, event, fn);
};

// traverses back up to the machine to continue chaining
State.prototype.state = function (name) {
    return this.machine.state(name);
};
