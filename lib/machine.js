
'use strict';

// dependencies
require('babel-polyfill-safe');
const debug = require('debug')('fsm:machine');
const Graph = require('graph.js/dist/graph.js')
const State = require('./state');


// single export
module.exports = function () {
  let graph = new Graph();

  return {

  };
};


function addState(graph, name) {
  let state = new State(name);
  graph.addNewVertex(name, state);
  return state;
}

function addTransition(graph, from, trigger, to) {
  graph.addNewEdge(from, to, trigger);
}

function getStates(graph) {
  return Array.from(graph.vertices()).map(item => item[1]);
}

function getState(graph, name) {
  return graph.vertexValue(name);
}

function getTransitionsFrom(graph, name) {
  return Array.from(graph.verticesFrom(name)).map(item => item[2]);
}
