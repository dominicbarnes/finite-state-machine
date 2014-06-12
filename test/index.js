var assert = require("assert");
var FSM = require("finite-state-machine");
var Machine = require("finite-state-machine/lib/machine.js");

describe("FSM(obj)", function () {
    it("should be the Machine constructor", function () {
        assert(FSM === Machine);
    });
});
