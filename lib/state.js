
'use strict';

// dependencies
const debug = require('debug')('fsm:state');
const Emitter = require('events');


// single export
module.exports = class State extends Emitter {};
