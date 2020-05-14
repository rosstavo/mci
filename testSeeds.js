const fn          = require('./functions.js');
const shuffleSeed = require('shuffle-seed');

let daySeed               = fn.daysBetween( new Date("May 11 2020 00:00:00 UTC"), new Date(new Date().toUTCString()) );
let weekSeed              = Math.floor(daySeed / 7);
let fortnightSeed         = Math.floor(daySeed / 14);



console.log( new Date(new Date().toUTCString()) );
