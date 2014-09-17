var assert = require("assert");
var FSM = require("finite-state-machine");
var Machine = require("finite-state-machine/lib/machine.js");

describe("FSM(obj)", function () {
    it("should be the Machine constructor", function () {
        assert(FSM === Machine);
    });

    it("should work properly on constructors", function (done) {
        function F() {
            this.start();
        }

        FSM(F.prototype)
            .state("a")
                .on("next", "b")
            .state("b")
                .enter(function () {
                    assert(this === inst);
                    done();
                });

        var inst = new F();
        inst.handle("next");
    });

    it("should not clobber other instances", function () {
        function F() {
            this.start();
        }

        FSM(F.prototype)
            .state("a")
                .on("next", "b")
            .state("b");

        var inst1 = new F();
        var inst2 = new F();

        inst1.handle("next");
        assert(inst1.currentState() !== inst2.currentState(), "current states should differ");
    });

    it("should preserve context properly", function () {
        function F() {
            this.start();
        }

        FSM(F.prototype)
            .state("a")
                .on("next", function () {
                    assert(this === expected);
                    this.transition("b");
                })
            .state("b")
                .on("next", function () {
                    assert(this === expected);
                });

        var inst1 = new F();
        var inst2 = new F();

        var expected = inst1;
        inst1.handle("next");
        inst1.handle("next");

        expected = inst2;
        inst2.handle("next");
        inst2.handle("next");
    });
});
