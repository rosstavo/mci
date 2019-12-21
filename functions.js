module.exports = {
    discordFormatEmbed: (content, embed) => {

        const TurndownService = require('turndown');
        const truncate        = require('truncate-html');

        // Convert content to Markdown
        var turndownService = new TurndownService();

        var truncatedHTML = truncate(content, 1024, { ellipsis: '... [Content clipped]' });

        var markdown = turndownService.turndown(truncatedHTML);

        return embed.setDescription(markdown);

    },
    getScript: (url) => {
        return new Promise((resolve, reject) => {
            const http      = require('http'),
                  https     = require('https');

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

        embed.setAuthor( 'INCOMING TRANSMISSION FROM INTEL. OFFICER DSGN. “HELPER”', 'https://liturgistsrpg.com/imgs/helper.png' )
            .setFooter( '[This message is encrypted and cannot be read without a cypher.]' )
            .setColor(0xf2edd8);

        return embed;
    }
};
