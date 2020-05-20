module.exports = {
	name: 'buy',
	aliases: [
		'buy',
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const fn = require('../functions.js');
		const fs = require('fs');

		const today = new Date(new Date().toUTCString());
		const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

		let dialogue = require('../dialogue.json');

		let msgContent = msg.content.split(' ');

		msgContent = msgContent.filter( arg => {
			return ! arg.match(/<[^>]*>/g) && arg !== module.exports.name;
		} );

		let index = msgContent.filter( arg => {
			return ! isNaN( arg );
		} );

		if ( Array.isArray(index) ) {
			index = index[0];
		}

		let stock = JSON.parse( fs.readFileSync('stock.json') );

		if (date !== stock.date) {
			msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.error_generic ) ) );

		    return;
		}

		if ( stock.items[index-1].qty < 1 ) {
			msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.stock_sold_out ) ) );

			return;
		}

		stock.items[index-1].qty = stock.items[index-1].qty - 1;

		let stockDialogue = fn.arrayRand(dialogue.stock_last_one);

		if ( stock.items[index-1].qty > 0 ) {
			stockDialogue = fn.arrayRand(dialogue.stock_left);
		}

		fs.writeFile( 'stock.json', JSON.stringify(stock), 'utf-8', function (err) {
			if (err) throw err;

			msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.buy ) + ' ' + stockDialogue, [stock.items[index-1].item, stock.items[index-1].price, stock.items[index-1].qty] ) );
		} );

        return true;

	},
};
