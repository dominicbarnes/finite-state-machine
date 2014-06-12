var assert = require("assert");
var Machine = require("finite-state-machine/lib/machine.js");
var State = require("finite-state-machine/lib/state.js");

describe("State(machine, name)", function () {
    it("should be a Function", function () {
        assert(typeof State === "function");
    });

    it("should set the machine and name properties", function () {
        var machine = {};
        var state = new State(machine, "test");
        assert(state.machine === machine);
        assert(state.name === "test");
    });
});

describe("State#on(event, fn)", function () {
    it("should interpret a string to mean it should transition to that step", function () {
        var machine = {
            transition: function (state) {
                assert(state === "bar");
            }
        };

        var state = new State(machine, "test");
        state.on("foo", "bar");
        state.emit("foo");
    });

    it("should still allow functions as handlers", function (done) {
        var state = new State({}, "test");
        state.on("foo", done);
        state.emit("foo");
    });

    it("should allow wrapped functions (ex: Emitter#once)", function (done) {
        var state = new State({}, "test");
        done.fn = done;
        state.on("foo", done);
        state.emit("foo");
    });

    it("should still work with Emitter#once()", function (done) {
        var state = new State({}, "test");
        var counter = 0;

        state.once("foo", function () {
            if (++counter > 1) throw new Error("called too many times");
        });
        state.emit("foo");

        state.once("foo", done);
        state.emit("foo");
    });
});

describe("State#state(name)", function () {
    it("should return a call to this.machine.state(name)", function () {
        var machine = {
            state: function (name) {
                assert(name === "b");
            }
        };

        var state = new State(machine, "a");
        state.state("b");
    });
});
