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

        embed.setFooter('To buy an item, add it to your inventory and subtract the gold amount.')
            .setColor(0xbcaaa4);

        return embed;
    },
    weeksBetween: (d1, d2) => {
        return Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
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
    }

};
