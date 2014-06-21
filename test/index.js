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
});
