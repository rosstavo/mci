module.exports = {
	name: 'restock',
	aliases: [
		'restock',
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

        /**
         * We're using this command asynchronously, so we need to wrap it all in
         * a promise. At least, I think we need to. I haven't done a lot of work
         * with async functions before.
         */
        return new Promise((resolve, reject) => {

            const fn          = require('../functions.js');
            const Fuse        = require('fuse.js');
            const fs          = require('fs');
            const shuffleSeed = require('shuffle-seed');
            const Papa        = require('papaparse');

            /**
             * Get the dialogue
             */
            const dialogue = require('../data/dialogue.json');

            /**
             * What time/date is it
             */
            let today = new Date(new Date().toUTCString());
            let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

            /**
             * Get the current stock
             */
            let stock = JSON.parse(fs.readFileSync('./data/stock.json'));

            /**
             * Reply with loading message, then do all the restocking work
             */
            msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.loading ) ) ).then( msg => ( async (url) => {

                /**
                 * Get the Google Sheet
                 */
                let csv = await fn.getScript(url);

                /**
                 * If we can't find it, something's gone really wrong, so let's
                 * just throw an error.
                 */
                if ( ! csv ) {
                    throw new Error('Can’t find the CSV.');
                }

                /**
                 * Parse player spreadsheet
                 */
                let data = Papa.parse(csv, {
                    "header": true
                });

                /**
                 * Let's pick up some new stock
                 */
                let newStock = [];

                /**
                 * Create a unique seed for the day
                 */
                let seed = Math.floor((today - new Date(process.env.STARTDATE)) / (24 * 60 * 60 * 1000));

                /**
                 * Do a first shuffle, for good luck (not really necessary)
                 */
                let gems = shuffleSeed.shuffle(data.data, seed).slice(0, 6);

                /**
                 * Loop through and shuffle
                 */
                for (let i = 0; i < 6; i++ ) {

                    /**
                     * Shuffle using a unique seed for day + index
                     */
                    let gems = await shuffleSeed.shuffle(data.data, seed + `-${i}`);

                    /**
                     * Roll the dice and get our price
                     */
                    let price = await fn.rollDice(gems[0].diceqty, gems[0].die).then( res => {
                        return res * gems[0].multiplier;
                    } );

                    /**
                     * Get the CR for the gem
                     */
                    let cr = fn.getCR(price)

                    /**
                     * Add it to our new stock
                     */
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

                /**
                 * Sort by price
                 */
                stock.items = newStock.sort(fn.compareValues('price'));

                /**
                 * Let's get our magic items
                 */
                let magic = require('../data/magic.json');

                /**
                 * Shuffle them using our day seed
                 */
                let formulae = shuffleSeed.shuffle(magic, seed).filter( item => ! item.exclude ).slice(0, 3);

                /**
                 * Add the formulae to our new stock
                 */
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

                /**
                 * And add a date to the stock
                 */
                stock.date = date;

                try {

                    /**
                     * Store the stock
                     */
                    fs.writeFileSync('./data/stock.json', JSON.stringify(stock), 'utf-8', function(err) {
                        if (err) throw err;
                    });

                    /**
                     * Add a note that the stock's been refreshed
                     */
                    msg.edit( msg.content + ' `Stock refreshed.`' );

                } catch (error) {

                    console.error(error);

                    reject(true);
                }

                /**
                 * Resolve the promise
                 */
                resolve(true);

            } )(process.env.GEMS) );

        } );


	},
};
