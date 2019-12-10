module.exports = {
	name: '!character',
	aliases: ['!player'],
	args: true,
	description: 'This command displays character information.',
	execute(msg, args, embed) {

		if ( ! args[0] ) {
			return;
		}

		const puppeteer = require('puppeteer');
		const Papa      = require('papaparse');
		const Fuse      = require('fuse.js');
		const functions = require('../functions.js');

		embed.setTitle( 'Fetching info… this may take a few moments.' );

		msg.channel.send( embed ).then( message => ( async (url) => {

			var csv = await functions.getScript(url);

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

			// console.log( results );


			// If nothing found, quit out
			if ( ! results.length ) {
			   embed.setDescription( 'No results found.' );

			   msg.channel.send( embed );

			   return;
			}


			// Take our first result and generate the LK URL
			var result = results[0].item;

			embed.setTitle( `Character Info: ${result['Player']}` );

			if ( result['Summary'] !== '' ) {
				embed.setDescription( result['Summary'] );
			}

			if ( result['dndbeyond'] !== '' ) {
				embed.setURL( result['dndbeyond'] );

				// Get Puppeteer running
				const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
				const page = await browser.newPage();
				await page.setViewport({ width: 1280, height: 800 });

				await page.goto(result['dndbeyond']);

				await page.waitFor('.ct-quick-info');

				var selectors = {
					'Race': '.ct-character-tidbits__race',
					'Class': '.ct-character-tidbits__classes',
					'Pronouns': '.ct-character-tidbits__gender',
					'Languages': '.ct-proficiency-groups__group:last-child .ct-proficiency-groups__group-items',
				};

				selectors = await page.evaluate( (selectors) => {

					for (const [title, selector] of Object.entries(selectors)) {

						try {
							selectors[title] = document.querySelector(selector).innerText;

						} catch (error) {
							selectors[title] = '–';
						}

					}

					return selectors;

				}, selectors );

				for (const [title, content] of Object.entries(selectors)) {
					embed.addField( title, content, true );
				}

				const avatar = await page.evaluate( () => {

					try {
						var element = document.querySelector('.ct-character-tidbits__avatar');

						var img = window.getComputedStyle(element).backgroundImage.slice(4, -1).replace(/"/g, "");
					} catch (error) {
						var img = 'https://liturgistsrpg.com/imgs/helper.png';
					}

					return img;

				} );

				embed.setThumbnail( avatar );

				await browser.close();
			}

			// if ( result['Character pronouns'] !== '' ) {
			// 	embed.addField( 'Character pronouns', result['Character pronouns'], true );
			// }

			if ( result['Discord'] !== '' && result['Player pronouns'] !== '' ) {
				embed.addField( 'Player', `<@${result['Discord']}> (${result['Player pronouns']})`, false );
			}

			embed.addField( 'Stats', `${ result['Player'] } is currently level ${ result['Level'] } with ${ result['Remaining'] } XP remaining until leveling up.`, false );

			if ( result['Sessions'] !== '' ) {
				embed.addField( 'Sessions played in total', result['Sessions'], true );
			}

			if ( result['Days since first session'] !== '' ) {
				embed.addField( 'Days since first session', result['Days since first session'], true );
			}

			if ( result['Days since last session'] !== '' ) {
				embed.addField( 'Days since last session', result['Days since last session'], true );
			}

			// if ( result['Portrait'] !== '' ) {
			// 	embed.setThumbnail( result['Portrait'] );
			// }

			message.edit( embed );

		} )('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv') );

	},
};
