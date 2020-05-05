module.exports = {
	name: 'stock',
	aliases: [
		'stock',
		'what do you have for sale',
		'what\'s in stock',
		'what\'s for sale this week',
		'items',
		'for sale',
		'in stock'
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const Fuse        = require('fuse.js');
		const fn   		  = require('../functions.js');
		const shuffleSeed = require('shuffle-seed');
		const Papa        = require('papaparse');

		var dialogue = require('../dialogue.json');

		var magic = require('../magic.json');

		embed = fn.formatEmbed(embed);

		msg.reply( fn.formatDialogue( fn.arrayRand(dialogue.loading) ) ).then( message => ( async (url) => {

			var csv = await fn.getScript(url);

			var data = Papa.parse( csv, {
				"header": true
			} );

			var query = msg.author.id;

			// Options for Fuse
			var fuseOptions = {
				shouldSort: true,
				includeScore: true,
				threshold: 0.3,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					'Discord'
				]
			};

			// Instantiate Fuse, do the search
			var fuse = new Fuse( data.data, fuseOptions );
			var results = fuse.search(query);

			// If nothing found, quit out
			if ( ! results.length ) {

			   msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.error_player_not_found ) ) );

			   return;
			}


			var result = results[0].item;


			embed.setTitle( 'Stock List' )
				.setDescription( 'Otsuildagne’s rules of purchase:\n```1. One of each item available per customer. \n2. For item value appraisals or more specific item acquisitions, please schedule a meeting for 25 gp. \n3. Take off your shoes at the door.```' );

			const seed = fn.weeksBetween( new Date(), new Date(2019, 12, 24) );

			// Set random seed for all items
			items = shuffleSeed.shuffle( magic, seed );

			items.slice(1,10).forEach( function(row) {
				if ( ! fn.canBuy( parseInt(result['Level']), row.rarity ) ) {
					return;
				}

				if ( row["Type"] === 'Spell Scrolls' ) {
					return;
				}

				embed.addField( row.item, `${row.dmpg} gp\n${row.rarity}`, true );
			} );

			embed.addField('—', '**Formulae:**');

			items.slice(10,13).forEach( function(row) {

				if ( row.Type === 'Spell Scrolls' ) {
					return;
				}

				embed.addField( `Crafting Recipe: ${row.item}`, `200 gp\n${row.rarity}`, true );
			} );

			message.channel.send(
				fn.formatDialogue( fn.arrayRand( dialogue.items_in_stock ) ),
				{ embed: embed }
			);

			return;

		} )('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv') );

		return;

	},
};
