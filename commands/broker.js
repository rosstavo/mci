module.exports = {
	name: 'stock',
	aliases: [
		'stock',
		'what do you have for sale',
		'what\'s in stock',
		'what\'s for sale this week',
		'items',
		'for sale',
		'in stock'
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const Fuse        = require('fuse.js');
		const fn   		  = require('../functions.js');
		const shuffleSeed = require('shuffle-seed');
		const Papa        = require('papaparse');

		/**
		 * Import dialogue
		 */
		let dialogue = require('../dialogue.json');

		/**
		 * Import magic items & filter
		 */
		let magic = require('../magic.json');

		magic = magic.filter( item => {

			if ( item['rarity'] === 'Legendary' ) {
				return false;
			}

			if ( item['Type'] === 'Spell Scrolls' ) {
				return false;
			}

			if ( item['exclude'] ) {
				return false;
			}

			return true;
		} );

		/**
		 * Format the embed in advance
		 */
		embed = fn.formatEmbed(embed);

		/**
		 * Reply to message and load player details
		 */
		msg.reply( fn.formatDialogue( fn.arrayRand(dialogue.loading) ) ).then( message => ( async (url) => {

			/**
			 * Load player spreadsheet
			 */
			let csv = await fn.getScript(url);

			/**
			 * Parse player spreadsheet
			 */
			let data = Papa.parse( csv, {
				"header": true
			} );

			/**
			 * Check message author ID against spreadsheet
			 */
			let query = msg.author.id;

			// Options for Fuse
			let fuseOptions = {
				shouldSort: true,
				includeScore: true,
				threshold: 0.3,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					'Discord'
				]
			};

			/**
			 * Instantiate Fuse, do the search
			 */
			let fuse = new Fuse( data.data, fuseOptions );
			let results = fuse.search(query);

			/**
			 * Prepare the embed
			 */
			embed.setTitle( 'Stock List' );

			embed.setDescription( 'Otsuildagne’s rules of purchase…' );

			embed.addField( 'Rule 1:', 'One of each item available per customer. (Ammunition limit 5.)', true );
			embed.addField( 'Rule 2:', `For item value appraisals or more specific items, please schedule a meeting for ${process.env.COIN}\`25 gp\`.`, true );
			embed.addField( 'Rule 3:', 'Take off your shoes at the door.', true );

			/**
			 * Set random seeds for all items
			 */
			let daySeed               = fn.daysBetween( new Date("May 11 2020 00:00:00 GMT"), new Date(new Date().toUTCString()) );
			let weekSeed              = Math.floor(daySeed / 7);
			let fortnightSeed         = Math.floor(daySeed / 14);

			let itemsToday = shuffleSeed.shuffle( magic, daySeed ).map( function(el) {
				var o = Object.assign({}, el);
				o.isNew = true;
				return o;
			} );

			let itemsYesterday        = shuffleSeed.shuffle( magic, daySeed - 1 ).map( function(el) {
				var o = Object.assign({}, el);
				o.lastChance = true;
				return o;
			} );

			let itemsThisWeek         = shuffleSeed.shuffle( magic, weekSeed ).map( function(el) {
				var o = Object.assign({}, el);

				if ( weekSeed !== Math.floor((daySeed - 1) / 7) ) {
					o.isNew = true;
				}
				return o;
			} );

			let itemsLastWeek         = shuffleSeed.shuffle( magic, weekSeed - 1 ).map( function(el) {
				var o = Object.assign({}, el);

				if ( weekSeed !== Math.floor((daySeed + 1) / 7) ) {
					o.lastChance = true;
				}
				return o;
			} );

			let itemsThisFortnight    = shuffleSeed.shuffle( magic, fortnightSeed ).map( function(el) {
				var o = Object.assign({}, el);

				if ( fortnightSeed !== Math.floor((daySeed - 1) / 14) ) {
					o.isNew = true;
				}

				if ( fortnightSeed !== Math.floor((daySeed + 1) / 14) ) {
					o.lastChance = true;
				}
				return o;
			} );

			let dailyitems = [].concat(
				itemsToday.filter( item => item.rarity === 'Common' ).slice(0,2),
				itemsYesterday.filter( item => item.rarity === 'Common' ).slice(0,2),
				itemsToday.filter( item => item.rarity === 'Uncommon' ).slice(0,1),
				itemsYesterday.filter( item => item.rarity === 'Uncommon' ).slice(0,1),
			);

			let weeklyItems = [].concat(
				itemsThisWeek.filter( item => item.rarity === 'Rare' ).slice(0,1),
				itemsLastWeek.filter( item => item.rarity === 'Rare' ).slice(0,1)
			);

			let fortnightlyItems = itemsThisFortnight.filter( item => item.rarity === 'Very Rare' ).slice(0,1);

			let forSale = [].concat(
				dailyitems,
				weeklyItems,
				fortnightlyItems
			).sort( fn.compareValues('avg') );

			let playerString = `The items you can purchase correspond to your level.\n\n${process.env.COMMON} **Common**: any level\n${process.env.UNCOMMON} **Uncommon**: level 5 and above\n${process.env.RARE} **Rare**: level 9 and above\n${process.env.VERYRARE} **Very Rare**: level 12 and above\n\n`

			if ( results.length ) {

				let result = results[0].item;

				playerString = `${result['Player']} is Level ${result['Level']} and can purchase Items up to a rarity of ${process.env[fn.canBuy(result['Level']).toUpperCase().replace( /[^a-zA-Z0-9]/ , "")]} ${fn.canBuy(result['Level'])}.`;

			}

			embed.addField('—', `\u200b\n:crossed_swords: **Items**\n\n${playerString}` );


			forSale.forEach( function(row) {

				let emoji = process.env[row.rarity.toUpperCase().replace( /[^a-zA-Z0-9]/ , "")];

				let note = '';

				if ( row.isNew ) {
					note = '\n:star2: New in stock!';
				}

				if ( row.lastChance ) {
					note = '\n:clock11: Last chance!';
				}

				embed.addField(
					row['Type'],
					`**${row.item}**\n${emoji} ${row.rarity}\n${process.env.COIN}\`${fn.numberWithCommas(row.dmpg)} gp\`${note}\n\u200b`,
					true
				);

			} );

			/**
			 * Formulae
			 */
			let recipesThisWeek = itemsThisWeek.filter( item => item.rarity !== 'Common' ).slice(-3).map( function(el) {
				var o = Object.assign({}, el);

				if ( weekSeed !== Math.floor((daySeed - 1) / 7) ) {
					o.isNew = true;
				}
				return o;
			} );

			let recipesLastWeek = itemsLastWeek.filter( item => item.rarity !== 'Common' ).slice(-3).map( function(el) {
				var o = Object.assign({}, el);

				if ( weekSeed !== Math.floor((daySeed + 1) / 7) ) {
					o.lastChance = true;
				}
				return o;
			} );

			let recipes = [].concat(
				recipesThisWeek,
				recipesLastWeek
			).sort( fn.compareValues('avg') );

			embed.addField('—', '\u200b\n:scroll: **Formulae**\n\nFormulae can be purchased at any Level.');

			recipes.forEach( function(row) {

				let emoji = process.env[row.rarity.toUpperCase().replace( /[^a-zA-Z0-9]/ , "")];

				let note = '';

				if ( row.isNew ) {
					note = '\n:star2: New in stock!';
				}

				if ( row.lastChance ) {
					note = '\n:clock11: Last chance!';
				}

				embed.addField(
					'Crafting Formula',
					`**${row.item}**\n${emoji} ${row.rarity}\n${process.env.COIN} \`200 gp\`${note}\n\u200b`,
					true
				);

			} );

			let nextMidnight = new Date();
			nextMidnight.setUTCHours(24,0,0,0);

			let now = new Date();

			let remainingTimeObj = fn.msToTime(nextMidnight.getTime() - now.getTime());

			embed.setFooter( `The Broker will acquire new stock in ${remainingTimeObj.h} hour(s) and ${remainingTimeObj.m} minute(s).` );

			message.channel.send(
				fn.formatDialogue( fn.arrayRand( dialogue.items_in_stock ) ),
				{ embed: embed }
			);

			return;

		} )('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv') );

		return;

	},
};
