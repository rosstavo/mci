module.exports = {
	name: '!backup',
	description: 'Advanced LegendKeeper integration.',
	execute(msg, args, embed) {

		/**
		 * Grab our methods
		 */
		const puppeteer = require('puppeteer');
		const fs = require('fs');

		// Take our first result and generate the LK URL
		var url = 'https://app.legendkeeper.com/a/worlds/ck0a4wp3rr78z0815mrh7bg86/wiki/ck3pn6n9slu4e0815008sbysw';

		embed.setTitle( 'Fetching info from LegendKeeper… this may take a few moments.' );

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
				await page.waitFor('.tree-controls > .fa-plus-square');

				await page.click('.tree-controls > .fa-plus-square');

				var currentWiki = await page.evaluate(() => {
					const TREE_EXPAND_STATE = JSON.parse(localStorage.getItem('TREE_EXPAND_STATE'));

					return Object.keys( TREE_EXPAND_STATE );
				});

				var cachedWiki = JSON.parse( fs.readFileSync('lk.json') );

				var newWiki = cachedWiki.filter( function(entry) {
					return currentWiki.includes(entry.key);
				} );

				const removed = cachedWiki.length - newWiki.length;

				var newPages = new Array();

				currentWiki.forEach( function(id) {

					if ( newWiki.map(a => a.key).includes(id) ) {
						return;
					}

					if ( id === 'root' ) {
						return;
					}

					newPages.push(id);
				} );

				if ( newPages.length ) {

					embed.setDescription( `Retrieving ${newPages.length} new page(s)...` );

					message.edit( embed );

					for (let i = 0; i < newPages.length; i++) {

						const newPage = newPages[i];

						let url = `https://app.legendkeeper.com/a/worlds/ck0a4wp3rr78z0815mrh7bg86/wiki/${newPage}`;

						await page.evaluate( ( { userId, token } ) => {
							localStorage.setItem('userId', userId);
							localStorage.setItem('token', token);
						}, { userId, token } );

						await page.goto(url, { waitUntil: 'networkidle0' });

						await page.waitForFunction('document.querySelector("title").innerText != "LegendKeeper"');

						let title = await page.evaluate(() => {
							return document.querySelector('title').innerText;
						});

						newWiki.push({
							'key': newPage,
							'val': title.replace( ' [Wiki]', '' )
						});

						embed.setDescription( `Completed ${i+1} of ${newPages.length}` );

						message.edit( embed );
					}

				}

				fs.writeFile( 'lk.json', JSON.stringify(newWiki), 'utf-8', function (err) {
					if (err) throw err;

					embed.setTitle( 'Backup complete. LegendKeeper database updated.' );

					message.edit( embed );
			    } );

			} catch (error) {

				embed.setTitle( 'There was an error backing up the database.' );

				embed.setDescription( `\`\`\`${error.message}\`\`\`` );

				message.edit( embed );

				await browser.close();

				return;

			}

			// Close the browser
			await browser.close();

		} )( ) );


	},
};
