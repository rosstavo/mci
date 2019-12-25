module.exports = {
	name: '!broker',
	aliases: ['!appraise'],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const Fuse        = require('fuse.js');
		const functions   = require('../functions.js');
		const shuffleSeed = require('shuffle-seed');
		const fs 		  = require('fs');
		const Papa        = require('papaparse');

		var magic = require('../magic.json');

		embed = functions.formatBroker(embed);

		if ( ! args[0] ) {

			embed.setTitle( '“One moment please…”' );

			msg.channel.send( embed ).then( message => ( async (url) => {

				var csv = await functions.getScript(url);

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
				   embed.setDescription( '“Sorry I don’t know who you are. Please could you contact a DM?”' );

				   msg.channel.send( embed );

				   return;
				}


				var result = results[0].item;


				embed.setTitle( '“Hello darling, here’s what I have for sale this week…”' )
					.setDescription( 'Otsuildagne’s rules of purchase:\n```1. One of each item available per customer. \n2. For item value appraisals or more specific item acquisitions, please schedule a meeting for 25 gp. \n3. Take off your shoes at the door.```' );

				const seed = functions.weeksBetween( new Date(), new Date(2019, 12, 24) );

				// Set random seed for all items
				items = shuffleSeed.shuffle( magic, seed );

				items.slice(1,10).forEach( function(row) {
					if ( ! functions.canBuy( parseInt(result['Level']), row.rarity ) ) {
						return;
					}

					embed.addField( row.item, `${row.dmpg} gp\n${row.rarity}`, true );
				} );

				embed.addField('—', '**Formulae:**');

				items.slice(10,13).forEach( function(row) {
					embed.addField( `Crafting Recipe: ${row.item}`, `200 gp\n${row.rarity}`, true );
				} );

				message.edit( embed );

				return;

			} )('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv') );

			return;
		}

		var query = args.join(' ');

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
				'item'
			]
		};

		// Instantiate Fuse, do the search
		var fuse = new Fuse( magic, fuseOptions );
		var results = fuse.search(query);

		// If nothing found, quit out
		if ( ! results.length ) {
		   embed.setTitle( '“Sorry darling, looks like I haven’t encountered one of them yet.”' );

		   msg.channel.send( embed );

		   return;
		}

		var result = results[0].item;

		var formula = result.price.replace("×","*");

		console.log( result );

		(async (url) => {

			var response = await functions.getScript(url);

			response = JSON.parse( response );

			embed.setTitle( `“My offer for your ${result.item} is ${response.result.toLocaleString()} gold pieces.”` );

			if ( parseInt(response.result) > parseInt(result.dmpg.toString().replace(',','')) / 2 ) {
				embed.setDescription( 'You sense this is offer is above average.' );
			} else if ( parseInt(response.result) < parseInt(result.dmpg.toString().replace(',','')) / 2 ) {
				embed.setDescription( 'You sense this is offer is below average.' );
			} else {
				embed.setDescription( 'You sense this is a reasonable offer.' );
			}

			msg.channel.send( embed );

		})(`https://rolz.org/api/?${formula}.json`);



	},
};
