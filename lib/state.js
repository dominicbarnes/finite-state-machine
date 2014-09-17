// single export
module.exports = State;

/**
 * Represents a state within a state machine
 *
 * @param {Machine} machine
 * @param {String}  name
 */
function State(name) {
    this.name = name;
    this._handlers = {};
}

/**
 * Adds a handler for the specified event
 *
 * @param  {String}   event
 * @param  {Function} fn
 * @return {State}
 */
State.prototype.on = function (event, fn) {
    if (typeof fn === "string") {
        var state = fn;
        fn = function () {
            this.transition(state);
        };
    }

    this._handlers[event] = fn;
    return this;
};

/**
 * Sets the enter handler
 *
 * @param  {Function} fn
 * @return {State}
 */
State.prototype.enter = function (fn) {
    return this.on("_enter", fn);
};

/**
 * Sets the exit handler
 *
 * @param  {Function} fn
 * @return {State}
 */
State.prototype.exit = function (fn) {
    return this.on("_exit", fn);
};

/**
 * Runs the specified handler with the `machine` as the context
 *
 * @param  {Machine}     machine
 * @param  {String}      event
 * @param  {Array:Mixed} [args]
 * @return {Mixed}
 */
State.prototype.runHandler = function (machine, event, args) {
    var fn = this._handlers[event];
    if (fn) return fn.apply(machine, args);
};
