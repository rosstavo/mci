module.exports = {
    name: 'buy',
    aliases: [
        'buy',
        'purchase',
        'I would like to buy',
        'I would like to purchase',
        'please may I buy',
        'please may I purchase'
    ],
    description: 'This command works with the broker.',
    execute(msg, args, embed) {

        const fn = require('../functions.js');
        const fs = require('fs');

        /**
         * What's the date?
         */
        const today = new Date(new Date().toUTCString());
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        /**
         * Get dialogue
         */
        const dialogue = require('../data/dialogue.json');

        /**
         * What's our message content?
         */
        let msgContent = msg.content.split(' ');

        msgContent = msgContent.filter(arg => {
            return !arg.match(/<[^>]*>/g) && arg !== module.exports.name;
        });

        /**
         * We only want a number from the content
         */
        let index = msgContent.filter(arg => {
            return !isNaN(arg);
        });

        if (Array.isArray(index)) {
            index = index[0];
        }

        /**
         * Get the stock
         */
        let stock = JSON.parse(fs.readFileSync('./data/stock.json'));

        /**
         * Double check that the current date matches the stock
         */
        if (date !== stock.date) {
            msg.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));

            return;
        }

        /**
         * Let the customer know if the item is sold out
         */
        if (stock.items[index - 1].qty < 1) {
            msg.reply(fn.formatDialogue(fn.arrayRand(dialogue.stock_sold_out)));

            return;
        }

        /**
         * New stock quantity for the item
         */
        stock.items[index - 1].qty = stock.items[index - 1].qty - 1;

        /**
         * Let the customer know how many of that item are left
         */
        let stockDialogue = fn.arrayRand(dialogue.stock_last_one);

        if (stock.items[index - 1].qty > 0) {
            stockDialogue = fn.arrayRand(dialogue.stock_left);
        }

		let dialogueBuy = fn.formatDialogue(
			fn.arrayRand(dialogue.buy) + ' ' + stockDialogue + ' ' + fn.arrayRand(dialogue.cancellation),
			[
				stock.items[index - 1].item,
				stock.items[index - 1].price,
				stock.items[index - 1].qty
			]
		);

		msg.reply( dialogueBuy ).then(() => {

			fs.writeFile('./data/stock.json', JSON.stringify(stock), 'utf-8', function(err) {
				if (err) throw err;
			});

			const filter = response => {
				return response.author.id === msg.author.id && response.content.match(/cancel/i);
			};

			msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
				.then(collected => {
					msg.channel.send( fn.formatDialogue(fn.arrayRand(dialogue.cancelled_order)) );

					stock = JSON.parse(fs.readFileSync('./data/stock.json'));

					stock.items[index - 1].qty = stock.items[index - 1].qty + 1;

					/**
					 * Store the new stock value, and message the customer
					 */
					fs.writeFile('./data/stock.json', JSON.stringify(stock), 'utf-8', function(err) {
						if (err) throw err;
					});
				})
				.catch(collected => {

					/**
					 * Get the log
					 */
					let log = JSON.parse(fs.readFileSync('./data/log.json'));

					let item = stock.items[index - 1];

					item.date = today;

					log.push(item);

					/**
					 * Store the new stock value, and message the customer
					 */
					fs.writeFile('./data/log.json', JSON.stringify(log), 'utf-8', function(err) {
						if (err) throw err;
					});

				});

			});


        /**
         * Probably not necessary
         */
        return true;

    },
};
