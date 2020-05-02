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

        embed.setAuthor('INCOMING TRANSMISSION FROM INTEL. OFFICER DSGN. “HELPER”', 'https://liturgistsrpg.com/imgs/helper.png')
            .setFooter('[This message is encrypted and cannot be read without a cypher.]')
            .setColor(0xf2edd8);

        return embed;
    },
    formatBroker: (embed) => {

        embed.setAuthor('The Broker says…', 'https://liturgistsrpg.com/wp-content/uploads/Otsuildagne.jpg', 'https://liturgistsrpg.com/codex/the-broker/')
            .setThumbnail('https://liturgistsrpg.com/wp-content/uploads/Otsuildagne.jpg')
            .setFooter('Thank you for visiting Otsuildagne, the Broker.')
            .setColor(0xf2edd8);

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
            i = Math.floor( rand * m-- ); // <-- MODIFIED LINE

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
    canBuy: (level, rarity) => {
        if ( rarity === 'Legendary' && level < 17 ) {
            return false;
        }

        if ( rarity === 'Very Rare' && level < 11 ) {
            return false;
        }

        if ( rarity === 'Rare' && level < 5 ) {
            return false;
        }

        return true;
    }
};
