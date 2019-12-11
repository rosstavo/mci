module.exports = {
	name: '!lk',
	aliases: ['!legendkeeper','!lookup','!find'],
	description: 'Advanced LegendKeeper integration.',
	execute(msg, args, embed) {

		/**
		 * Grab our methods
		 */
		const puppeteer       = require('puppeteer');
		const Fuse            = require('fuse.js');
		const fs              = require('fs');
		const TurndownService = require('turndown');
		const truncate        = require('truncate-html');
		const functions	      = require('../functions.js');

		// Get our query as a string
		var query = args.join(' ');

		// Raw data from LegendKeeper crawl
		var rawLegendKeeperData = fs.readFileSync('lk.json');
		var legendKeeperList = JSON.parse(rawLegendKeeperData);

		// Quit if no query
		if ( query === '' ) {
			
			var list = [];

			legendKeeperList.forEach( function( row ) {
				var char = row.val.substring(0,1);

				if ( ! char.match(/[a-z]/i) ) {
					char = 'Other';
				}

				var charArray = [];

				if ( list[char] ) {
					charArray = list[char];
				}

				charArray.push(row.val);

				list[char] = charArray;
			} );

			const alphabetSorting = [
				[ 'A', 'B', 'C', 'D', 'E' ],
				[ 'F', 'G', 'H', 'I', 'J' ],
				[ 'K', 'L', 'M', 'N', 'O' ],
				[ 'P', 'Q', 'R', 'S' ],
				[ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ],
				[ 'Other' ]
			];

			alphabetSorting.forEach( function( section ) {

				var fields = [];

				section.forEach( function( letter ) {
					fields = fields.concat( list[letter] );
				} );

				var title = section[0] + '—' + section[section.length - 1];

				embed.addField( title, fields.join( "\n" ), true );
			} );


			embed.setTitle( 'Showing all pages:' );

			msg.channel.send(embed);

			return;
		}

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
				'val'
			]
		};

		// Instantiate Fuse, do the search
		var fuse = new Fuse( legendKeeperList, fuseOptions );
		var results = fuse.search(query);

		// If nothing found, quit out
		if ( ! results.length ) {
		   embed.setDescription( 'No results found.' );

		   msg.channel.send( embed );

		   return;
		}

		// Take our first result and generate the LK URL
		var result = results[0];
		var url = `https://app.legendkeeper.com/a/worlds/ck0a4wp3rr78z0815mrh7bg86/wiki/${result.item.key}`;

		// Generate message to notify user we're grabbing the result
		embed.setTitle( `Showing content for "${result.item.val}"` )
			.setDescription( 'Fetching info from LegendKeeper… this may take a few moments.' )
			.setURL( url );

		// Add top 3 search results to message
		results = results.slice(0,3);

		results.forEach( function( row, index ) {

			var score = Math.floor((1 - row.score)*100);

			embed.addField(
				`${row.item.val}`,
				`[Link](https://app.legendkeeper.com/a/worlds/ck0a4wp3rr78z0815mrh7bg86/wiki/${row.item.key}) (${score}% match)`,
				true
			);
		} );

		/**
		 * Send that message, then retrieve result
		 */
		msg.channel.send(embed).then( message => ( async () => {

			var userId = process.env.LKUSERID;
			var token = process.env.LKTOKEN;

			// Get Puppeteer running
			const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
			const page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 800 });

			await page.goto(url);

			// Set our cookies
			await page.evaluate( ( { userId, token } ) => {
				localStorage.setItem('userId', userId);
				localStorage.setItem('token', token);
			}, { userId, token } );

			await page.goto(url, { waitUntil: 'networkidle0' });

			// Grab the content
			try {

				let content = await page.evaluate(() => {
					return document.querySelector('.ProseMirror-lk > .ProseMirror').innerHTML;
				});


				// Overwrite the Embed
				// embed.setDescription( markdown );

				embed = functions.discordFormatEmbed( content, embed );

			} catch (error) {

				embed.setDescription( 'Sorry, there was an error retrieving the article.' );

				message.edit( embed );

				await browser.close();

				return;

			}

			// Grab the thumbnail
			try {

				await page.click('.info-panel-image > canvas');

				let image = await page.evaluate(() => {
					return document.querySelector('.image-lightbox > img').src;
				});

				embed.setThumbnail( image );

			} catch (error) {
				embed.setThumbnail( 'https://liturgistsrpg.com/imgs/helper.png' );
			}


			message.edit( embed );

			// Close the browser
			await browser.close();

		} )( ) );


	},
};
