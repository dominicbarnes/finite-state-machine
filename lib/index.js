
'use strict';

const assert = require('assert');
const Machine = require('./machine');

module.exports = function (config) {
  assert(config, 'configuration is required');
  assert(config.states, 'state configuration is required');

  const states = Object.keys(config.states);
  const defaultState = config.defaultState || states[0];
  const machine = new Machine();

  states.forEach(state => machine.addState(state));
  states.forEach(from => {
    Object.keys(config.states[from]).forEach(trigger => {
      const to = config.states[from][trigger];
      machine.addTransition(from, trigger, to);
    });
  });

  return function () {
    return machine.clone();
  };
};
