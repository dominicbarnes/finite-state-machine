// dependencies
var Emitter = require("hooks-emitter");


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
    if (typeof fn === "string") {
        return this.on(event, function () {
            this.transition(fn);
        });
    }

    function callback() {
        fn.apply(this.machine, arguments);
    }

    if (fn.fn) {
        return Emitter.prototype.on.call(this, event, fn);
    } else {
        return Emitter.prototype.on.call(this, event, callback);
    }
};

State.prototype.once = function(event, fn) {
    var self = this;

    function on() {
        self.off(event, fn);
        fn.apply(this, arguments);
    }

    fn._off = on;
    on.fn = fn;
    this.on(event, on);

    return this;
};

// traverses back up to the machine to continue chaining
State.prototype.state = function (name) {
    return this.machine.state(name);
};
