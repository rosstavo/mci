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

			embed.setTitle( 'Stock List' );

			// let availability = fn.canBuy( parseInt(result['Level']), row.rarity );

			embed.setDescription( 'Otsuildagne’s rules of purchase…' );

			embed.addField( 'Rule 1:', 'One of each item available per customer.', true );
			embed.addField( 'Rule 2:', 'For item value appraisals or more specific item acquisitions, please schedule a meeting for 25 gp.', true );
			embed.addField( 'Rule 3:', 'Take off your shoes at the door.', true );

			// Set random seed for all items
			let seed                  = fn.weeksBetween( new Date(), new Date(2019, 12, 24) );

			let itemsThisWeek         = shuffleSeed.shuffle( magic, seed );
			let itemsLastWeek         = shuffleSeed.shuffle( magic, seed - 1 );

			let commonItemsThisWeek   = itemsThisWeek.filter( item => item.rarity === 'Common' ).slice(0,2);
			let commonItemsLastWeek   = itemsLastWeek.filter( item => item.rarity === 'Common' ).slice(0,2);

			let uncommonItemsThisWeek = itemsThisWeek.filter( item => item.rarity === 'Uncommon' ).slice(0,1);
			let uncommonItemsLastWeek = itemsLastWeek.filter( item => item.rarity === 'Uncommon' ).slice(0,1);

			let rareItemsThisWeek     = itemsThisWeek.filter( item => item.rarity === 'Rare' ).slice(0,1);
			let rareItemsLastWeek     = itemsLastWeek.filter( item => item.rarity === 'Rare' ).slice(0,1);

			let veryRareItemsThisWeek = itemsThisWeek.filter( item => item.rarity === 'Very Rare' ).slice(0,1);

			let forSale = [].concat(
				commonItemsThisWeek,
				commonItemsLastWeek,
				uncommonItemsThisWeek,
				uncommonItemsLastWeek,
				rareItemsThisWeek,
				rareItemsLastWeek,
				veryRareItemsThisWeek
			).sort( fn.compareValues('avg') );

			let recipesThisWeek = itemsThisWeek.filter( item => item.rarity !== 'Common' ).slice(-3);
			let recipesLastWeek = itemsLastWeek.filter( item => item.rarity !== 'Common' ).slice(-3);
			let recipes			= recipesThisWeek.concat(recipesLastWeek).sort( fn.compareValues('avg') );

			embed.addField('—', `\u200b\n:crossed_swords: **Items**\n\n${result['Player']} is Level ${result['Level']} and can purchase Items up to a rarity of ${process.env[fn.canBuy(result['Level']).toUpperCase().replace( /[^a-zA-Z0-9]/ , "")]} **${fn.canBuy(result['Level'])}**.` );

			forSale.forEach( function(row) {

				let emoji = process.env[row.rarity.toUpperCase().replace( /[^a-zA-Z0-9]/ , "")];

				embed.addField(
					`**${row.item}**`,
					`${emoji} ${row.rarity}\n${process.env.COIN} **${row.dmpg} gp**\n\u200b`,
					true
				);

			} );

			embed.addField('—', '\u200b\n:scroll: **Formulae**\n\nFormulae can be purchased at any Level.');

			recipes.forEach( function(row) {

				let emoji = process.env[row.rarity.toUpperCase().replace( /[^a-zA-Z0-9]/ , "")];

				embed.addField(
					`\nCrafting Formula:\n**${row.item}**`,
					`${emoji} ${row.rarity}\n${process.env.COIN} **200 gp**\n\u200b`,
					true
				);

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
