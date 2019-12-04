module.exports = {
	name: '!lkr',
	description: 'This command shows downtime activities.',
	execute(msg, args, embed) {

		/**
		 * Grab our methods
		 */
		const puppeteer = require('puppeteer');
		const Fuse = require('fuse.js');
		const fs = require('fs');
		const TurndownService = require('turndown');
		const truncate = require('truncate-html');

		// Get our query as a string
		var query = args.join(' ');

		// Quit if no query
		if ( query === '' ) {
			embed.setTitle( 'Please specify a search query.' );

			return;
		}

		// Options for Fuse
		var fuseOptions = {
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

		// Raw data from LegendKeeper crawl
		var rawLegendKeeperData = fs.readFileSync('lk.json');
		var legendKeeperList = JSON.parse(rawLegendKeeperData);

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
			.setDescription( 'Fetching info… this may take a few moments.' )
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
			const browser = await puppeteer.launch({ headless: false });
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

				// Convert content to Markdown
				var turndownService = new TurndownService();
				var markdown = turndownService.turndown( truncate( content, 1024, {
					ellipsis: '... [Content clipped]'
				} ) );

				// Overwrite the Embed
				embed.setDescription( markdown );
				message.edit( embed );

			} catch (error) {

				embed.setDescription( 'Sorry, there was an error retrieving the article.' );
				message.edit( embed );

			}

			// Close the browser
			await browser.close();

		} )( ) );


	},
};
