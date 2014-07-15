var assert = require("assert");
var Machine = require("finite-state-machine/lib/machine.js");
var State = require("finite-state-machine/lib/state.js");

describe("Machine(obj)", function () {
    it("should be a Function", function () {
        assert(typeof Machine === "function");
    });

    it("should be a mixin when called with an object argument", function () {
        var o = {};
        var fsm = Machine(o);

        assert.strictEqual(o, fsm);
        for (var prop in Machine.prototype) {
            assert.strictEqual(fsm[prop], Machine.prototype[prop]);
        }
    });

    it("should still create instances w/o arguments", function () {
        var fsm = new Machine();
        assert(fsm instanceof Machine);
    });
});

describe("Machine#state([name])", function () {
    it("should create the states hash when it does not exist", function () {
        var fsm = new Machine();
        assert(!fsm._states);
        fsm.state("test");
        assert(fsm._states);
    });

    it("should create a new `State` object with the name", function () {
        var fsm = new Machine();
        fsm.state("test");
        assert(fsm._states.test);
        assert(fsm._states.test instanceof State);
    });

    it("should set the initial state if not already set", function () {
        var fsm = new Machine();
        assert(!fsm._initialState);
        fsm.state("test");
        assert.equal(fsm._initialState, "test");
    });

    it("should return the new `State` object", function () {
        var fsm = new Machine();
        assert(fsm.state("test") instanceof State);
    });
});

describe("Machine#getState(name)", function () {
    it("should return the `State` object matching `name`", function () {
        var fsm = new Machine();
        fsm.state("test");
        var state = fsm.getState("test");
        assert(state instanceof State);
        assert(state.name === "test");
    });

    it("should throw for a state that does not exist for this machine", function () {
        var fsm = new Machine();
        fsm.state("test");
        assert.throws(function () {
            fsm.getState("does-not-exist");
        }, RangeError);
    });
});

describe("Machine#initialState(name)", function () {
    it("should set the internal property", function () {
        var fsm = new Machine();
        fsm.initialState("test");
        assert(fsm._initialState === "test");
    });

    it("should allow a `State` object as well", function () {
        var fsm = new Machine();
        fsm.initialState("test1");
        var state = fsm.state("test2");
        fsm.initialState(state);
        assert(fsm._initialState === "test2");
    });

    it("should return the Machine so it can be chainable", function () {
        var fsm = new Machine();
        assert(fsm.initialState("test") === fsm);
    });

    it("should return the string name for the initial state", function () {
        var fsm = new Machine();
        fsm.initialState("test");
        assert(fsm.initialState() === "test");
    });
});

describe("Machine#currentState(name)", function () {
    it("should set the internal property", function () {
        var fsm = new Machine();
        fsm.currentState("test");
        assert(fsm._currentState === "test");
    });

    it("should allow a `State` object as well", function () {
        var fsm = new Machine();
        fsm.currentState("test1");
        var state = fsm.state("test2");
        fsm.currentState(state);
        assert(fsm._currentState === "test2");
    });

    it("should return the Machine so it can be chainable", function () {
        var fsm = new Machine();
        assert(fsm.currentState("test") === fsm);
    });

    it("should return the string name for the current state", function () {
        var fsm = new Machine();
        fsm.currentState("test");
        assert(fsm.currentState() === "test");
    });
});

describe("Machine#handle(...)", function () {
    it("should emit an event on the current state object", function (done) {
        var fsm = new Machine();
        fsm.state("a").on("next", done).state("b");
        fsm.start();
        fsm.handle("next");
    });
});

describe("Machine#transition(state)", function () {
    var fsm = new Machine();

    fsm.state("a").state("b");

    beforeEach(function () {
        fsm.start();
    });

    it("should set the previous state internal property", function () {
        fsm.transition("b");
        assert(fsm._previousState === "a");
    });

    it("should set the current state internal property", function () {
        fsm.transition("b");
        assert(fsm._currentState === "b");
    });

    it("should emit an exit event on the current state", function (done) {
        fsm.state("a").once("exit", done);
        fsm.transition("b");
    });

    it("should emit an enter event on the next state", function (done) {
        fsm.state("b").once("enter", done);
        fsm.transition("b");
    });
});

describe("Machine#start()", function () {
    it("should transition to the initial step", function () {
        var fsm = new Machine();
        fsm.state("a");
        fsm.start();
        assert(fsm._currentState === fsm._initialState);
    });
});

describe("Machine#stop()", function () {
    it("should emit an exit event for the current step", function (done) {
        var fsm = new Machine();
        fsm.state("a").on("exit", done);
        fsm.start();

        fsm.stop();
    });

    it("should update the previous step internal property", function () {
        var fsm = new Machine();
        fsm.state("a").on("next", "b").state("b");
        fsm.start();

        fsm.stop();
        assert(fsm._previousState === "a");
    });

    it("should delete the current step internal property", function () {
        var fsm = new Machine();
        fsm.state("a").on("next", "b").state("b");
        fsm.start();

        fsm.stop();
        assert(!fsm._currentState);
    });
});
