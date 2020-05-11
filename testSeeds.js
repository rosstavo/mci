const fn   = require('./functions.js');

let daySeed               = fn.daysBetween( new Date("May 11 2020 00:00:00 GMT"), new Date(new Date().toUTCString().substr(0, 25)) );
let weekSeed              = Math.floor(daySeed / 7);
let fortnightSeed         = Math.floor(daySeed / 14);

console.log( daySeed );
