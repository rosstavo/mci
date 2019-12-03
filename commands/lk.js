module.exports = {
	name: '!lk',
	aliases: ['!legendkeeper','!lookup','!find'],
	description: 'This command shows downtime activities.',
	execute(msg, args, embed) {

		var query = args.join(' ');

		if ( ! args.length ) {
			embed.setTitle( 'Please specify a search query.' );
		} else {
			const Fuse = require('fuse.js');

			var options = {
				shouldSort: true,
				includeScore: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					'val'
				]
			};

			var list = require('../lk.json');

			var fuse = new Fuse( list, options );

			var results = fuse.search(query);

			embed.setTitle( `Search results for "${query}"`);

			if ( results.length ) {

				results.forEach( function( row, index ) {

					var score = Math.floor((1 - row.score)*100);

					embed.addField(
						`${row.item.val}`,
						`[Link](https://app.legendkeeper.com/a/worlds/ck0a4wp3rr78z0815mrh7bg86/wiki/${row.item.key}) (${score}% match)`,
						true
					);
				} );

			} else {

				embed.setDescription( 'No results found.' );
			}

		}


		msg.channel.send( embed );
	},
};
