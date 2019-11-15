module.exports = {
	name: '&character',
	aliases: ['&player'],
	args: true,
	description: 'This command displays character information.',
	execute(msg, args, embed) {

		if ( ! args[0] ) {
			return;
		}

		const Papa = require( 'papaparse' );

		const getScript = (url) => {
		    return new Promise((resolve, reject) => {
		        const http      = require('http'),
		              https     = require('https');

		        let client = http;

		        if (url.toString().indexOf("https") === 0) {
		            client = https;
		        }

		        client.get(url, (resp) => {
		            let data = '';

		            // A chunk of data has been recieved.
		            resp.on('data', (chunk) => {
		                data += chunk;
		            });

		            // The whole response has been received. Print out the result.
		            resp.on('end', () => {
		                resolve(data);
		            });

		        }).on("error", (err) => {
		            reject(err);
		        });
		    });
		};

		(async (url) => {

			var csv = await getScript(url);

			var data = Papa.parse( csv, {
				"header": true
			} );

			var query = msg.mentions.users.firstKey();

			var key = 'Player';

			if ( query ) {
				key = 'Discord';
			} else {
				query = args[0].toLowerCase().replace(/ /g,'');
			}

			console.log( query );

			var found = data.data.find( function(el) {
				return el[key].toLowerCase().replace(/ /g,'') === query;
			} );

			embed.setTitle( 'No character found.' )
				.setColor(0xf2edd8)
				.setDescription( 'Sorry, we could not find a character by that name.' );

			if ( found && found['Player'] !== '' ) {

				embed.setAuthor( 'Character Info' )
					.setTitle( found['Player'] )
					.setDescription( `${ found['Player'] } is currently level ${ found['Level'] } with ${ found['Remaining'] } XP remaining until levelling up. For more details, click the character name above.` );

				if ( found['Character pronouns'] !== '' ) {
					embed.addField( 'Character pronouns', found['Character pronouns'], true );
				}

				if ( found['Sessions'] !== '' ) {
					embed.addField( 'Sessions played', found['Sessions'], true );
				}

				if ( found['Days since last session'] !== '' ) {
					embed.addField( 'Days since last session', found['Days since last session'], true );
				}

				if ( found['Portrait'] !== '' ) {
					embed.setThumbnail( found['Portrait'] );
				}

				if ( found['dndbeyond'] !== '' ) {
					embed.setURL( found['dndbeyond'] );
				}

				if ( found['Discord'] !== '' && found['Player pronouns'] !== '' ) {
					embed.addField( 'Player', `<@${found['Discord']}> (${found['Player pronouns']})`, true );
				}

			}

			msg.channel.send( embed );

		})('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv');

	},
};
