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

		const Fuse          = require('fuse.js');
		const fn   		    = require('../functions.js');
		const fs   		    = require('fs');
		const shuffleSeed   = require('shuffle-seed');
		const Papa 		    = require('papaparse');
		const numberToWords = require('number-to-words');

		/**
		 * Get our data
		 */
		const months = require('../data/months.json');
		let stock    = JSON.parse( fs.readFileSync('./data/stock.json') );

		/**
		 * Import dialogue
		 */
		let dialogue = require('../data/dialogue.json');

		/**
		 * Format the embed in advance
		 */
		embed = fn.formatEmbed(embed);

		/**
		 * Prepare the embed
		 */
		const today = new Date(new Date().toUTCString());
		const date = today.getDate();
		const dateOrdinal = date + (date > 0 ? ['th', 'st', 'nd', 'rd'][(date > 3 && date < 21) || date % 10 > 3 ? 0 : date % 10] : '');

		embed.setTitle( `Stock List (${dateOrdinal} of ${months[today.getMonth()]})` );

		embed.setDescription( 'To buy one of the items below, type `@Prospector buy [item number]`. Stock quantity represents today only, and resets at midnight.\n\n(CR value represents the capacity of the gem for *[Capture Essence](https://toinen.world/codex/capture-essence/)*.)\n\u200b' );

		/**
		 * Loop through our stock
		 */
		let i = 1;

		stock.items.forEach( row => {

			/**
			 * Title
			 */
			let title = `:tools: **${row.item}**`;

			if ( row.type === 'Gem' ) {
				title = `:gem: **${row.item} [CR${fn.fractionConverter(row.cr)}]**`;
			}

			/**
			 * Description
			 */
			let description = row.description;

			if ( row.type === 'Gem' ) {
				description = `${description}. ${row.size} grade specimen.`;
			}

			/**
			 * Rarity emoji
			 */
			let emoji = process.env[row.rarity.toUpperCase().replace( /[^a-zA-Z0-9]/ , "")];

			/**
			 * Availability
			 */
			let stock = ':outbox_tray: \`Sold out\`';

			if (row.qty > 0) {
				stock = `:inbox_tray: \`${row.qty} in stock\``;
			}

			/**
			 * String it all together
			 */
			let meta = `\n${description}\n—\n${emoji} \`${row.rarity}\`\n${process.env.COIN} \`${fn.numberWithCommas(row.price)} gp\`\n${stock}\n\u200b`;

			embed.addField( `\`${i}\``, title + meta, true );

			i++;

		} );

		/**
		 * Get the crafting costs and format a field
		 */
		const craftingCosts = require('../data/craftingCosts.json');

		let craftingCostsString = '';

		Object.keys( craftingCosts ).forEach( item => {
			craftingCostsString += `${item} – ${process.env.COIN} \`${fn.numberWithCommas(craftingCosts[item])} gp\`\n`;
		} );

		embed.addField('—', `\u200b\n:tools: **Crafting Costs**\n\nAdventurers looking for crafting services need to provide a gem containing a creature essence.\n\n${craftingCostsString}`, true );

		/**
		 * Format a field for crafting times
		 */
		embed.addField('—', `\u200b\n:hourglass_flowing_sand: **Crafting Times**\n\nThe rarity of the resulting item depends on the CR of the essence used in crafting.\n\n${process.env.COMMON} \`Common (CR 0–3)\` – 1 week\n${process.env.UNCOMMON} \`Uncommon (CR 4–8)\` – 2 weeks\n${process.env.RARE} \`Rare (CR 9–12)\` – 5 weeks\n${process.env.VERYRARE} \`Very Rare (CR 13–18)\` – 10 weeks\n${process.env.LEGENDARY} \`Legendary (CR 19+)\` – 20 weeks`, true );

		/**
		 * Reply to message and load player details
		 */
		msg.channel.send(
			fn.formatDialogue( fn.arrayRand( dialogue.items_in_stock ) ),
			{ embed: embed }
		);

		/**
		 * Possibly not necessary
		 */
		return;

	},
};
