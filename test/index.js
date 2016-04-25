
'use strict';

const assert = require('chai').assert;
const fsm = require('..');


describe('fsm(config)', function () {
  const empty = { states: {} };

  it('should be a function', function () {
    assert.isFunction(fsm);
  });

  it('should return a function', function () {
    assert.isFunction(fsm(empty));
  });

  context('with config', function () {
    const turnstyle = fsm({
      states: {
        locked: {
          push: 'locked',
          coin: 'unlocked'
        },
        unlocked: {
          push: 'locked',
          coin: 'unlocked'
        }
      }
    });

    it('should have the configured states', function () {
      const t = turnstyle();
      console.log(t.getStates());
    });
  });
});
