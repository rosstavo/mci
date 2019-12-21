module.exports = {
	name: '!price',
	aliases: ['!cost'],
	args: true,
	description: 'This command displays character information.',
	execute(msg, args, embed) {

		if ( ! args[0] ) {
			return;
		}

		const Fuse      = require('fuse.js');
		const functions = require('../functions.js');

		var prices = require('../prices.json');

		var names = Object.keys(prices);
		var values = Object.values(prices);
		var data = [];

		for ( i = 0; i < names.length; i++ ) {

			data.push( {
				"name": names[i],
				"value": values[i]
			} );

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
				'name'
			]
		};

		// Instantiate Fuse, do the search
		var fuse = new Fuse( data, fuseOptions );
		var results = fuse.search(query);

		// console.log( results );


		// If nothing found, quit out
		if ( ! results.length ) {
		   embed.setDescription( 'No results found.' );

		   msg.channel.send( embed );

		   return;
		}


		// Take our first result and generate the LK URL
		var result = results[0].item;

		embed.setTitle('Showing result for: ' + result.name)
			.addField('Cost', result.value.cost, false);

		msg.channel.send( embed );
	},
};
