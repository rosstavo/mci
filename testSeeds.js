const fn          = require('./functions.js');
const shuffleSeed = require('shuffle-seed');

let daySeed               = fn.daysBetween( new Date("May 11 2020 00:00:00 UTC"), new Date(new Date().toUTCString()) );
let weekSeed              = Math.floor(daySeed / 7);
let fortnightSeed         = Math.floor(daySeed / 14);


let magic = require('./magic.json');

let itemsToday = shuffleSeed.shuffle( magic, daySeed ).map( function(el) {
    var o = Object.assign({}, el);
    o.isNew = true;
    return o;
} ).map( function(el) {
    return el.item;
} ).slice(0,10);

console.log( itemsToday );
