// dependencies
var Emitter = require("emitter");
var State = require("./state");
var debug = require("debug")("finite-state-machine");


// single export
module.exports = Machine;


/**
 * Represents a Finite State Machine
 *
 * @param {Object} [obj]  When used, this is loaded as a mixin
 * @returns {Object|Machine}
 */
function Machine(obj) {
    if (typeof obj === "object") return mixin(obj);
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

// configuration methods

/**
 * Gets the specified state for this machine. (will create the `State` object
 * when necessary)
 *
 * This is meant for the chainable API, it's not meant as a general-purpose
 * accessor. It returns the original `Machine` and updates a very hacky internal
 * property called the "modifying state". (which tracks what state the other
 * methods like on/enter/exit should apply to)
 *
 * @param {String} [name]
 * @returns {Machine}
 */
Machine.prototype.state = function (name) {
    if (!this._states) this._states = {};

    if (!(name in this._states)) {
        debug("creating new " + name + " State object");
        this._states[name] = new State(name);
    }

    var state = this._getState(name);

    if (!this._initialState) {
        debug("no initial state configured, using the " + name + " state");
        this.initialState(name);
    }

    this._modifyingState = state;
    return this;
};

/**
 * Attaches an event handler to the "modifying" state.
 *
 * @param  {Function} fn
 * @return {Machine}
 */
Machine.prototype.on = function (event, fn) {
  if (event === '$transition') {
    this._transitionHandler = fn;
  } else {
    this._modifyingState.on(event, fn);
  }
  return this;
};

/**
 * Attaches an enter handler to the "modifying" state.
 *
 * @param  {Function} fn
 * @return {Machine}
 */
Machine.prototype.enter = function (fn) {
  this._modifyingState.enter(fn);
  return this;
};

/**
 * Attaches an exit handler to the "modifying" state.
 *
 * @param  {Function} fn
 * @return {Machine}
 */
Machine.prototype.exit = function (fn) {
  this._modifyingState.exit(fn);
  return this;
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


// lifecycle methods

/**
 * Starts the state machine (ie: transition to the initial state)
 *
 * @return {Machine}
 */
Machine.prototype.start = function () {
    return this.transition(this._initialState);
};

/**
 * Handle an event for this state machine, forwards additional arguments as well.
 *
 * @param  {String} event   The name of the event
 * @param  {Mixed} ...args  All subsequent arguments are sent to the handler
 * @return {Machine}
 */
Machine.prototype.handle = function (event) {
    var state = this._getState(this._currentState);
    var args = [].slice.call(arguments, 1);
    debug("handling " + event + " event", args);
    this._getState(this._currentState).runHandler(this, event, args);
    return this;
};

/**
 * Transitions the machine to the specified state
 *
 * @param  {String} state  The name of the next state
 * @return {Machine}
 */
Machine.prototype.transition = function (state) {
    if (this._currentState) {
        debug("exiting " + this._currentState + " state");
        this._getState(this._currentState).runHandler(this, "_exit");
    }

    debug("entering " + state + " state");
    this._previousState = this._currentState;
    this._currentState = state;
    this._getState(this._currentState).runHandler(this, "_enter");
    return this;
};

/**
 * Get the current state of the machine.
 *
 * @returns {String}
 */
Machine.prototype.currentState = function () {
    return this._currentState;
};

/**
 * Get the previous state of the machine.
 *
 * @returns {String}
 */
Machine.prototype.previousState = function () {
    return this._previousState;
};


// private methods

/**
 * Retrieves the State object via it's `name`, throws a `RangeError` if not found
 *
 * @api private
 * @param {String} name
 * @return {State}
 */
Machine.prototype._getState = function (name) {
    if (!(name in this._states)) {
        throw new RangeError("The state " + name + " does not exist on this machine");
    }

    return this._states[name];
};
