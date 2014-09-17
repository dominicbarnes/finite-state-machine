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
        fsm.state("test2");
        var state = fsm.getState("test2");
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
        fsm.state("test2");
        var state = fsm.getState("test2");
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
    it("should run the handler attached to the state object", function (done) {
        var fsm = new Machine();
        fsm.state("a").on("next", done).state("b");
        fsm.start();
        fsm.handle("next");
    });
});

describe("Machine#transition(state)", function () {
    var fsm = new Machine();

    beforeEach(function () {
        fsm._states = {};
        fsm.state("a").state("b").start();
    });

    it("should set the previous state internal property", function () {
        fsm.transition("b");
        assert(fsm._previousState === "a");
    });

    it("should set the current state internal property", function () {
        fsm.transition("b");
        assert(fsm._currentState === "b");
    });

    it("should call the exit handler on the previous state", function (done) {
        fsm.state("a").exit(done);
        fsm.transition("b");
    });

    it("should emit an enter event on the next state", function (done) {
        fsm.state("b").enter(done);
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

    it("should update the 'modifying' placeholder", function () {
        var fsm = new Machine();
        fsm.state("test");
        assert.equal(fsm._modifyingState, fsm.getState("test"));
    });

    it("should return the `Machine` object", function () {
        var fsm = new Machine();
        assert(fsm.state("test") === fsm);
    });
});

describe("Machine#enter(fn)", function () {
    it("should operate on the 'modifying' state", function () {
        var fsm = new Machine();
        fsm.state("a").state("b");
        fsm.enter(noop);

        assert(!fsm.getState("a")._handlers._enter);
        assert.strictEqual(fsm.getState("b")._handlers._enter, noop);
    });

    it("should return the `Machine` object", function () {
        var fsm = new Machine();
        fsm.state("a");
        assert(fsm.enter(noop) === fsm);
    });
});

describe("Machine#on(event, fn)", function () {
    it("should operate on the 'modifying' state", function () {
        var fsm = new Machine();
        fsm.state("a").state("b");
        fsm.on("back", noop);

        assert(!fsm.getState("a")._handlers.back);
        assert.strictEqual(fsm.getState("b")._handlers.back, noop);
    });

    it("should return the `Machine` object", function () {
        var fsm = new Machine();
        fsm.state("a");
        assert(fsm.on("next", noop) === fsm);
    });
});

describe("Machine#exit(fn)", function () {
    it("should operate on the 'modifying' state", function () {
        var fsm = new Machine();
        fsm.state("a").state("b");
        fsm.exit(noop);

        assert(!fsm.getState("a")._handlers._exit);
        assert.strictEqual(fsm.getState("b")._handlers._exit, noop);
    });

    it("should return the `Machine` object", function () {
        var fsm = new Machine();
        fsm.state("a");
        assert(fsm.exit(noop) === fsm);
    });
});

function noop() {}
