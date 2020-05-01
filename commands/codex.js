module.exports = {
	name: '!codex',
	aliases: ['!lookup'],
	description: 'This command displays information about the previous session.',
	execute(msg, args, embed) {

		const functions = require( '../functions.js' );
		const he = require('he');

		(async (url) => {

			var query = args.join(' ');

			var results = await functions.getScript(url + encodeURI(query));

			results = JSON.parse( results );

			// If nothing found, quit out
			if ( ! results.length ) {
			   embed.setDescription( 'Sorry, no results found.' );

			   msg.channel.send( embed );

			   return;
			}


			embed.setTitle(`Showing search results for: “${query}”`);

			results = results.slice(0, 9);

			results.forEach( function( result ) {

				embed.addField(
					he.decode( result.title.rendered ),
					`[Link](${result.link})`,
					true
				);

			} );

			msg.channel.send( embed );

		})('http://liturgistsrpg.com/wp-json/wp/v2/codex?search=');

	},
};
