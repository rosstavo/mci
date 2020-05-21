module.exports = {
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
    formatEmbed: (embed) => {

        embed.setAuthor('Mineral Creek Initiative', 'https://toinen.world/imgs/mci.png', 'https://toinen.world/codex/the-mineral-creek-initiative/')
            .setFooter('Once you’ve bought an item, add it to your D&D Beyond inventory as a Custom Item. Ask a @dm if you need any help.')
            .setColor(0xbcaaa4);

        return embed;
    },
    arrayRand: (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
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
    getGemSize: (val, min, max) => {

        let rel = (val - min) / (max - min);

        if (rel < 0.2) {
            return 'C';
        }

        if (rel < 0.4) {
            return 'B';
        }

        if (rel < 0.6) {
            return 'A';
        }

        if (rel < 0.8) {
            return 'A+';
        }

        return 'S';
    },
    getGemRarity: (val) => {

        if (val < 4) {
            return 'Common';
        }

        if (val < 9) {
            return 'Uncommon';
        }

        if (val < 13) {
            return 'Rare';
        }

        if (val < 19) {
            return 'Very Rare';
        }

        return 'Legendary';
    },
    rollDice: (qty, sides) => {

        return new Promise((resolve, reject) => {

            let total = 0;

            for (let i = 0; i < qty; i++) {
                total = total + Math.floor(Math.random() * sides) + 1;
            }

            resolve(total);

        });

    },
    getCR: (value) => {

        const cr = require('./data/cr.json');

        const crs = Object.keys(cr).map(key => {
            return parseFloat(key);
        }).sort(function(a, b) {
            return a - b;
        });

        let lowestCR = false;

        let i = 0;

        crs.forEach(key => {

            if (cr[key] > value && !lowestCR) {
                lowestCR = crs[i - 1];
            }

            i++;

        });

        return lowestCR;

    },
    fractionConverter: (number) => {

        if ( number >= 1 ) {
            return number;
        }

        var fraction = number - Math.floor(number);
        var precision = Math.pow(10, /\d*$/.exec(new String(number))[0].length);
        var getGreatestCommonDivisor = function(fraction, precision) {
            if (!precision)
                return fraction;
            return getGreatestCommonDivisor(precision, fraction % precision);
        }
        var greatestCommonDivisor = getGreatestCommonDivisor(Math.round(fraction * precision), precision);
        var denominator = precision / getGreatestCommonDivisor(Math.round(fraction * precision), precision);
        var numerator = Math.round(fraction * precision) / greatestCommonDivisor;

        function reduce(numer, denom) {
            for (var i = 2; i >= 9; i++) {
                if ((numer % i === 0) && (denom % i) === 0) {
                    numerator = numer / i;
                    denominator = denom / i;
                    reduce(numerator, denominator);
                };
            };
        }

        reduce(numerator, denominator);

        return numerator + "/" + denominator;
    }


};
