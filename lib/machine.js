// dependencies
var State = require("./state");
var debug = require("debug")("finite-state-machine");


// single export
module.exports = Machine;


/**
 * Represents a State Machine, extending the functionality of Emitter
 *
 * @param {Object} [obj]  When used, this is loaded as a mixin
 * @returns {Object|Machine}
 */
function Machine(obj) {
    if (typeof obj === "object") return mixin(obj);

    // We need to reset the "machine" object to point to the instance
    // instead of the prototype. Currently requires an additional call
    // in the constructor... :(
    for (var name in this._states) {
        this._states[name].machine = this;
    }
}

/**
 * Augments the input object with Machine.prototype methods
 *
 * @param {Object} obj
 * @returns {Object}
 */
function mixin(obj) {
    debug("turning object into a state machine via mixin", obj);

    for (var key in Machine.prototype) {
        obj[key] = Machine.prototype[key];
    }

    return obj;
}

/**
 * Gets the specified state for this machine. (will create the state
 * object when necessary)
 *
 * If no `name` is passed, it will return the current state.
 *
 * @param {String} [name]
 * @returns {State}
 */
Machine.prototype.state = function (name) {
    if (!this._states) this._states = {};

    if (!(name in this._states)) {
        debug("creating new " + name + " State object");
        this._states[name] = new State(this, name);
    }

    var state = this.getState(name);

    if (!this._initialState) {
        debug("no initial state configured, using the " + name + " state");
        this.initialState(name);
    }

    return state;
};

Machine.prototype.getState = function (name) {
    if (!(name in this._states)) {
        throw new RangeError("The state " + name + " does not exist on this machine");
    }

    return this._states[name];
};

/**
 * Get/set the initial state of the machine
 *
 * @param {String|State} state
 * @returns {Machine}
 */
Machine.prototype.initialState = function (state) {
    if (typeof state === "undefined") return this._initialState;
    this._initialState = state instanceof State ? state.name : state;
    return this;
};

/**
 * Get/set the current state of the machine
 *
 * @param {String|State} state
 * @returns {Machine}
 */
Machine.prototype.currentState = function (state) {
    if (typeof state === "undefined") return this._currentState;
    this._currentState = state instanceof State ? state.name : state;
    return this;
};

Machine.prototype.handle = function (event) {
    var state = this.getState(this._currentState);
    debug("handling " + event + " event", [].slice.call(arguments, 1));
    state.emit.apply(state, arguments);
    return this;
};

Machine.prototype.transition = function (state) {
    if (this._currentState) {
        debug("exiting " + this._currentState + " state");
        this.handle("exit");
    }

    debug("entering " + state + " state");
    this._previousState = this._currentState;
    return this.currentState(state).handle("enter");
};

Machine.prototype.start = function () {
    debug("starting machine at " + this._initialState + " state");
    this.transition(this._initialState);
};

Machine.prototype.stop = function () {
    debug("stopping machine at " + this._currentState + " state");
    this.handle("exit");
    this._previousState = this._currentState;
    delete this._currentState;
};
