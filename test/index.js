var assert = require("assert");
var FSM = require("finite-state-machine");
var Machine = require("finite-state-machine/lib/machine.js");

describe("FSM(obj)", function () {
    it("should be the Machine constructor", function () {
        assert(FSM === Machine);
    });

    it("should work properly on constructors", function (done) {
        function F() {
            FSM.call(this);
        }

        FSM(F.prototype)
            .state("a")
                .on("next", "b")
            .state("b")
                .on("enter", function () {
                    assert(this === inst);
                    done();
                });

        var inst = new F();

        inst.start();
        inst.handle("next");
    });

    it("should not clobber other instances", function () {
        function F() {
            FSM.call(this);
        }

        FSM(F.prototype)
            .state("a")
                .on("next", "b")
            .state("b");

        var inst1 = new F();
        var inst2 = new F();

        inst1.start();
        inst2.start();

        inst1.handle("next");
        assert(inst1.currentState() !== inst2.currentState(), "current states should differ");
    });
});
