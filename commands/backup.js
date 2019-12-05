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
				await page.click('.tree-controls > .fa-plus-square');

				let content = await page.evaluate(() => {

					const elements = Array.from(document.querySelectorAll('.wiki-tree-item-container'));

					return elements.map( el => {
						return {
							key: el.id,
							val: el.querySelector('.label-container > span').innerText
						};
					} );

				});

				// console.log( content );

				fs.writeFile( 'lk.json', JSON.stringify(content), 'utf-8', function (err) {
					if (err) throw err;

					embed.setTitle( 'Backup complete. LegendKeeper database updated.' );

					message.edit( embed );
			    } );

			} catch (error) {

				embed.setTitle( 'There was an error backing up the database.' );

				message.edit( embed );

				await browser.close();

				return;

			}

			// Close the browser
			await browser.close();

		} )( ) );


	},
};
