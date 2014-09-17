var assert = require("assert");
var Machine = require("finite-state-machine/lib/machine.js");
var noop = require("noop");
var State = require("finite-state-machine/lib/state.js");

describe("State(machine, name)", function () {
    it("should be a Function", function () {
        assert(typeof State === "function");
    });

    it("should set the name and handler properties", function () {
        var state = new State("test");
        assert.equal(state.name, "test");
        assert.deepEqual(state._handlers, {});
    });
});

describe("State#on(event, fn)", function () {
    it("should augment the _handlers index", function () {
        var state = new State("a");
        state.on("next", noop);
        assert.deepEqual(state._handlers, { next: noop });
    });

    it("should create a function from a string", function () {
        var state = new State("a");
        state.on("next", "b");

        var machine = {
            transition: function (name) {
                assert.equal(name, "b");
            }
        };

        state.runHandler(machine, "next");
    });
});

describe("State#enter(fn)", function () {
    it("should be treated as a _enter handler", function () {
        var state = new State("a");
        state.enter(noop);
        assert.deepEqual(state._handlers, { _enter: noop });
    });

    it("should return itself", function () {
        var state = new State("a");
        assert.strictEqual(state.enter(noop), state);
    });
});

describe("State#exit(fn)", function () {
    it("should be treated as a _exit handler", function () {
        var state = new State("a");
        state.exit(noop);
        assert.deepEqual(state._handlers, { _exit: noop });
    });

    it("should return itself", function () {
        var state = new State("a");
        assert.strictEqual(state.exit(noop), state);
    });
});

describe("State#runHandler(ctx, event, ...args)", function () {
    it("should call the fn with the specified context", function () {
        var machine = {};
        var state = new State("a");
        state.on("next", function () {
            assert(this === machine);
        });
        state.runHandler(machine, "next");
    });

    it("should call the fn with arguments", function () {
        var machine = {};
        var state = new State("a");
        state.on("next", function (a, b, c) {
            assert.equal(a, 1);
            assert.equal(b, 2);
            assert.equal(c, 3);
        });
        state.runHandler(machine, "next", [ 1, 2, 3 ]);
    });
});
