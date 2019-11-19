module.exports = {
	name: '!character',
	aliases: ['!player'],
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

			var found = data.data.find( function(el) {

				if ( msg.mentions.users.firstKey() ) {
					return el['Discord'] === msg.mentions.users.firstKey();
				}

				return el['Player'].toLowerCase().replace(/ /g,'') === args.join('').toLowerCase();

			} );

			if ( ! found ) {

				found = data.data.find( function(el) {

					if ( el['Names'] == '' ) {
						return false;
					}

					return JSON.parse( el['Names'] ).find( function(el) {
						return el.toLowerCase().replace(/ /g,'') === args.join('').toLowerCase();
					} );

				} );

			}

			embed.setTitle( 'No character found.' )
				.setDescription( 'Sorry, I could not find a character by that name.' );

			if ( found && found['Player'] !== '' ) {

				embed.setTitle( `Character Info: ${found['Player']}` );

				if ( found['Names'] !== '' ) {
					embed.addField( 'Also known as', JSON.parse( found['Names'] ).filter( function(el) {
						return el !== found['Player'];
					} ).join(', '), true );
				}

				if ( found['Summary'] !== '' ) {
					embed.setDescription( found['Summary'] );
				}

				if ( found['Character pronouns'] !== '' ) {
					embed.addField( 'Character pronouns', found['Character pronouns'], true );
				}

				if ( found['Discord'] !== '' && found['Player pronouns'] !== '' ) {
					embed.addField( 'Player', `<@${found['Discord']}> (${found['Player pronouns']})`, false );
				}

				embed.addField( 'Stats', `${ found['Player'] } is currently level ${ found['Level'] } with ${ found['Remaining'] } XP remaining until levelling up. For more details, click the character name above.`, false );

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

			}

			msg.channel.send( embed );

		})('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv');

	},
};
