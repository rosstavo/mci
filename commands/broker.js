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

		let dialogue = require('../dialogue.json');

		let magic = require('../magic.json');

		magic = magic.filter( item => {

			if ( item['rarity'] === 'Legendary' ) {
				return false;
			}

			if ( item['Type'] === 'Spell Scrolls' ) {
				return false;
			}

			return true;
		} );

		embed = fn.formatEmbed(embed);

		msg.reply( fn.formatDialogue( fn.arrayRand(dialogue.loading) ) ).then( message => ( async (url) => {

			let csv = await fn.getScript(url);

			let data = Papa.parse( csv, {
				"header": true
			} );

			let query = msg.author.id;

			// Options for Fuse
			let fuseOptions = {
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
			let fuse = new Fuse( data.data, fuseOptions );
			let results = fuse.search(query);

			// If nothing found, quit out
			if ( ! results.length ) {

			   msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.error_player_not_found ) ) );

			   return;
			}


			let result = results[0].item;


			embed.setTitle( 'Stock List' )
				.setDescription( 'Otsuildagne’s rules of purchase:\n```1. One of each item available per customer. \n2. For item value appraisals or more specific item acquisitions, please schedule a meeting for 25 gp. \n3. Take off your shoes at the door.```' );

			// Set random seed for all items
			let seed            = fn.weeksBetween( new Date(), new Date(2019, 12, 24) );
			let itemsThisWeek   = shuffleSeed.shuffle( magic, seed ).slice(0,5);
			let recipesThisWeek = shuffleSeed.shuffle( magic, seed ).slice(5,8);
			let itemsLastWeek   = shuffleSeed.shuffle( magic, seed - 1 ).slice(0,4);
			let items           = itemsThisWeek.concat(itemsLastWeek, recipesThisWeek);

			items.slice(0,9).forEach( function(row) {
				let availability = fn.canBuy( parseInt(result['Level']), row.rarity );

				embed.addField( `${row.item} (${row.rarity})`, `:moneybag: **${row.dmpg} gp**\n${availability}`, true );
			} );

			embed.addField('—', '**Formulae:**');

			items.slice(9,12).forEach( function(row) {
				embed.addField( `Crafting Formula: ${row.item} (${row.rarity})`, `:moneybag: **200 gp**\nAvailable!`, true );
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
