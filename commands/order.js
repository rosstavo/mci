module.exports = {
	name: 'order',
	aliases: [
		'order',
		'when is in stock',
		'when',
		'order time',
		'how long until you have',
		'how long until you get'
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const Fuse        = require('fuse.js');
		const fn   		  = require('../functions.js');
		const sw		  = require('stopword');

		let dialogue = require('../dialogue.json');

		let magic = require('../magic.json');

		let query = sw.removeStopwords( args ).join(' ');

		// Options for Fuse
		let fuseOptions = {
			shouldSort: true,
			includeScore: true,
			threshold: 0.5,
			location: 0,
			distance: 100,
			minMatchCharLength: 4,
			findAllMatches: true,
			keys: [
				'item'
			]
		};

		// Instantiate Fuse, do the search
		let fuse = new Fuse( magic, fuseOptions );

		let results = fuse.search( query );

		// If nothing found, quit out
		if ( ! results.length ) {

		   msg.reply( fn.formatDialogue( fn.arrayRand(dialogue.error_generic) + ' ' + fn.arrayRand(dialogue.error_item_not_found) ) );

		   return;
		}

		let result = results[0].item;

		magic = magic.filter( item => {

			if ( item['rarity'] === 'Legendary' ) {
				return false;
			}

			if ( item['Type'] === 'Spell Scrolls' ) {
				return false;
			}

			if ( item['exclude'] ) {
				return false;
			}

			return true;
		} );

		let days = 0;
		let reply = false;
		let stockQty = require('../stockQty.json');

		if ( ! magic.find( el => el.item === result.item ) ) {
			reply = fn.formatDialogue(fn.arrayRand( dialogue.error_not_available ), [ result.item ]);
		}

		while ( ! reply ) {

			let date = new Date(new Date().toUTCString());

			let allItems = fn.itemsForDay(magic, stockQty, date.setDate(date.getDate() + days)).filter( item => !("formula" in item) ).sort( fn.compareValues('avg') );

		    if ( allItems.find( el => el.item === result.item ) ) {

		        let foundIn = days;

		        let lower = Math.floor(foundIn * (Math.random() * 0.5 + 0.5) / 7);
		        let upper = Math.floor(foundIn * (Math.random() * 0.5 + 1) / 7);

				if ( lower === 0 && upper < 2 ) {
					reply = fn.formatDialogue(fn.arrayRand( dialogue.expected_stock_date_this_week ), [ result.item ]);

					break;
				}

				if ( lower === upper ) {
					reply = fn.formatDialogue(fn.arrayRand( dialogue.expected_stock_date_x_weeks ), [ result.item, lower.toString() ]);

					break;
				}

		        reply = fn.formatDialogue( fn.arrayRand(dialogue.expected_stock_date_range), [ result.item, lower.toString(), upper.toString() ] );

				break;
		    }

		    days++;

			if ( days > 365 ) {
				reply = fn.formatDialogue(fn.arrayRand( dialogue.error_stock_date_not_found ), [ result.item ] );

				break;
			}

		}

		msg.reply( reply );

        return true;

	},
};
