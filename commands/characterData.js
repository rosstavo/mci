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
		const Fuse = require( 'fuse.js' );

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
					'Player'
				]
			};

			// Instantiate Fuse, do the search
			var fuse = new Fuse( data.data, fuseOptions );
			var results = fuse.search(query);

			console.log( results );


			// If nothing found, quit out
			if ( ! results.length ) {
			   embed.setDescription( 'No results found.' );

			   msg.channel.send( embed );

			   return;
			}


			// Take our first result and generate the LK URL
			var result = results[0].item;

			embed.setTitle( `Character Info: ${result['Player']}` );

			if ( result['Names'] !== '' ) {
				embed.addField( 'Also known as', JSON.parse( result['Names'] ).filter( function(el) {
					return el !== result['Player'];
				} ).join(', '), true );
			}

			if ( result['Summary'] !== '' ) {
				embed.setDescription( result['Summary'] );
			}

			if ( result['Character pronouns'] !== '' ) {
				embed.addField( 'Character pronouns', result['Character pronouns'], true );
			}

			if ( result['Discord'] !== '' && result['Player pronouns'] !== '' ) {
				embed.addField( 'Player', `<@${result['Discord']}> (${result['Player pronouns']})`, false );
			}

			embed.addField( 'Stats', `${ result['Player'] } is currently level ${ result['Level'] } with ${ result['Remaining'] } XP remaining until levelling up. For more details, click the character name above.`, false );

			if ( result['Sessions'] !== '' ) {
				embed.addField( 'Sessions played in total', result['Sessions'], true );
			}

			if ( result['Days since first session'] !== '' ) {
				embed.addField( 'Days since first session', result['Days since first session'], true );
			}

			if ( result['Days since last session'] !== '' ) {
				embed.addField( 'Days since last session', result['Days since last session'], true );
			}

			if ( result['Portrait'] !== '' ) {
				embed.setThumbnail( result['Portrait'] );
			}

			if ( result['dndbeyond'] !== '' ) {
				embed.setURL( result['dndbeyond'] );
			}

			msg.channel.send( embed );

		})('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv');

	},
};
