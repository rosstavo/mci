module.exports = {
	name: 'restock',
	aliases: [
		'restock',
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

        return new Promise((resolve, reject) => {

            const fn          = require('../functions.js');
            const Fuse        = require('fuse.js');
            const fs          = require('fs');
            const shuffleSeed = require('shuffle-seed');
            const Papa        = require('papaparse');

            const dialogue = require('../dialogue.json');

            let today = new Date(new Date().toUTCString());
            let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

            let stock = JSON.parse(fs.readFileSync('./stock.json'));

            msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.loading ) ) ).then( msg => ( async (url) => {

                let csv = await fn.getScript(url);

                if ( ! csv ) {
                    throw new Error('Can’t find the CSV.');
                }

                /**
                 * Parse player spreadsheet
                 */
                let data = Papa.parse(csv, {
                    "header": true
                });

                let newStock = [];

                let seed = Math.floor((today - new Date(process.env.STARTDATE)) / (24 * 60 * 60 * 1000));

                let gems = shuffleSeed.shuffle(data.data, seed).slice(0, 6);

                for (let i = 0; i < 6; i++ ) {

                    let gems = await shuffleSeed.shuffle(data.data, seed + `-${i}`);

                    let price = await fn.rollDice(gems[0].diceqty, gems[0].die).then( res => {
                        return res * gems[0].multiplier;
                    } );


                    let cr = fn.getCR(price)

                    newStock.push({
                        "item"       : gems[0].item,
                        "description": gems[0].description,
                        "rarity"     : fn.getGemRarity(cr),
                        "price"      : price,
                        "size"       : fn.getGemSize(price, gems[0].diceqty * gems[0].multiplier, gems[0].diceqty * gems[0].die * gems[0].multiplier),
                        "cr"         : cr,
                        "qty"        : 1,
                        "type"       : "Gem"
                    });

                }

                stock.items = newStock.sort(fn.compareValues('price'));

                let magic = require('../magic.json');

                let formulae = shuffleSeed.shuffle(magic, seed).filter( item => {

                    if ( item['Type'] === 'Spell Scrolls' ) {
                        return false;
                    }

                    if ( item['exclude'] ) {
                        return false;
                    }

                    return true;

                } ).slice(0, 3);

                for (let i in formulae) {

                    newStock.push({
                        "item"       : 'Crafting Formula: ' + formulae[i].item,
                        "description": 'Multiple use',
                        "rarity"     : formulae[i].rarity,
                        "price"      : 200,
                        "value"      : formulae[i].avg,
                        "qty"        : 1,
                        "type"       : "Formula"
                    });

                }

                // stock.date = date;

                // Store stock
                try {
                    fs.writeFileSync('stock.json', JSON.stringify(stock), 'utf-8', function(err) {
                        if (err) throw err;
                    });

                    msg.edit( '`Stock refreshed.`' );
                } catch (error) {
                    console.error(error);
                }

                resolve(true);

            } )('https://docs.google.com/spreadsheets/d/e/2PACX-1vTYQa-Tc32vE1mN1V26HiTN8xyJzzczgzXcykynyuqQahqLqgCyGn-7IwwmgBto9JE7MTRH0ETP7OmX/pub?gid=1177386660&single=true&output=csv') );

        } );


	},
};
