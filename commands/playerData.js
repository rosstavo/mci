module.exports = {
	name: '!player',
	description: 'This command lists commands.',
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
				return el["Player"].toLowerCase().replace(/ /g,'') === args[0].toLowerCase().replace(/ /g,'');
			} );

			embed.setTitle( 'No player found.' )
				.setColor(0xBBBBBB)
				.setDescription( 'Sorry, we could not find a character by that name.' );

			if ( found && found['Player'] !== '' ) {

				embed.setAuthor( 'Player Info' )
					.setTitle( found['Player'] )
					.setDescription( `${ found['Player'] } is currently level ${ found['Level'] } with ${ found['Remaining'] } XP until they level up.` )
					.addField( 'Sessions played', found['Sessions'], false )
					.addField( 'Days since last session', found['Days since last session'], false );

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
