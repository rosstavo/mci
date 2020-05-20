module.exports = {
    discordFormatEmbed: (content, embed) => {

        const TurndownService = require('turndown');
        const truncate = require('truncate-html');

        // Convert content to Markdown
        var turndownService = new TurndownService();

        var truncatedHTML = truncate(content, 1024, {
            ellipsis: '... [Content clipped]'
        });

        var markdown = turndownService.turndown(truncatedHTML);

        return embed.setDescription(markdown);

    },
    getScript: (url) => {
        return new Promise((resolve, reject) => {
            const http = require('http'),
                https = require('https');

            let client = http;

            if (url.toString().indexOf("https") === 0) {
                client = https;
            }

            client.get(url, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    resolve(data);
                });

            }).on("error", (err) => {
                reject(err);
            });
        });
    },
    groupBy: (list, keyGetter) => {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    },
    formatEmbed: (embed) => {

        embed.setAuthor( 'Mineral Creek Initiative', 'https://toinen.world/imgs/mci.png', 'https://toinen.world/codex/the-mineral-creek-initiative/' )
            .setFooter('Once you’ve bought an item, add it to your D&D Beyond inventory as a Custom Item. Ask a @dm if you need any help.')
            .setColor(0xbcaaa4);

        return embed;
    },
    daysBetween: (d1, d2) => {
        return Math.floor((d2 - d1) / (24 * 60 * 60 * 1000));
    },
    weeksBetween: (d1, d2) => {
        return Math.floor((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
    },
    shuffle: (array, rand, callback) => {

        var m = array.length,
            t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(rand * m--); // <-- MODIFIED LINE

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
            ++rand // <-- ADDED LINE
        }

        return array;
    },
    random: (seed) => {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    },
    arrayRand: (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    canBuy: (level) => {

        if (level > 11) {
            return 'Very Rare';
        }

        if (level > 8) {
            return 'Rare';
        }

        if (level > 4) {
            return 'Uncommon';
        }

        return 'Common';
    },
    formatDialogue: (str, words = false) => {
        const vsprintf = require('sprintf-js').vsprintf;

        if (words.length) {
            str = vsprintf(str, words);
        }

        return `**“${str}”**`;
    },
    compareValues: (key, order = 'asc') => {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            const varA = (typeof a[key] === 'string') ?
                a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ?
                b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    },
    numberWithCommas: (x) => {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    },
    isToday: (someDate) => {
        const today = new Date()
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear();
    },
    msToTime: (s) => {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return {
            "ms": ms,
            "s": secs,
            "m": mins,
            "h": hrs
        };
    },
    newMap: ( arr, conditional, flag = '' ) => {

        return arr.map( function(el) {
            var o = Object.assign({}, el);

            if ( conditional ) {
                o[flag] = true;
            }

            return o;
        } );

    },
    itemsForDay: (arr, args, dateObj) => {

        require('dotenv').config();

        const shuffleSeed = require('shuffle-seed');

        let seed = Math.floor((dateObj - new Date(process.env.STARTDATE)) / (24 * 60 * 60 * 1000));

        let items = [];

        args.forEach( arg => {

            Object.keys( arg.items ).forEach( key => {

                items = items.concat( shuffleSeed.shuffle( arr, Math.floor( (seed + arg.offset) / arg.interval ) ).filter( item => item.rarity === key ).map( el => {

                    var o = Object.assign({}, el);

                    Object.keys( arg.timedFlags ).forEach( key => {

                        if ( seed % arg.interval === arg.timedFlags[key] ) {
                            o[key] = true;
                        }

                    } );

                    if ( arg.flags ) {
                        arg.flags.forEach( flag => o[flag] = true );
                    }

                    return o;

                } ).slice( 0, arg.items[key] ) );

            } );

        } );

        return items;
    },
    getGemSize: (val, min, max) => {

        let rel = (val - min) / (max - min);

        if ( rel < 0.2 ) {
            return 'C';
        }

        if ( rel < 0.4 ) {
            return 'B';
        }

        if ( rel < 0.6 ) {
            return 'A';
        }

        if ( rel < 0.8 ) {
            return 'A+';
        }

        return 'S';
    },
    getGemRarity: (val) => {

        if ( val < 4 ) {
            return 'Common';
        }

        if ( val < 9 ) {
            return 'Uncommon';
        }

        if ( val < 13 ) {
            return 'Rare';
        }

        if ( val < 19 ) {
            return 'Very Rare';
        }

        return 'Legendary';
    },
    rollDice: (qty, sides) => {

        let total = 0;

        for ( let i = 0; i < qty; i++ ) {
            total = total + Math.floor(Math.random() * sides) + 1;
        }

        return total;
    },
    getCR: (value) => {

        const cr = require( './cr.json' );

        const crs = Object.keys(cr);

        let lowestCR = false;

        let i = 0;

        crs.forEach( key => {

            if ( cr[key] > value && ! lowestCR ) {
                lowestCR = crs[i-1];
            }

            i++;

        } );

        return lowestCR;

    }

};
