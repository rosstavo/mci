module.exports = {
	name: 'appraise',
	aliases: [
		'appraise',
		'please can you appraise',
		'how much is this worth',
		'how much is my',
		'how much',
		'what is this worth',
		'please appraise'
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const Fuse        = require('fuse.js');
		const fn   	      = require('../functions.js');
		const shuffleSeed = require('shuffle-seed');
		const fs 		  = require('fs');
		const sw		  = require('stopword');

		var dialogue = require('../dialogue.json');

		var magic = require('../magic.json');

		var query = sw.removeStopwords( args ).join(' ');

		// Options for Fuse
		var fuseOptions = {
			shouldSort: true,
			includeScore: true,
			threshold: 0.5,
			location: 0,
			distance: 100,
			minMatchCharLength: 4,
			findAllMatches: true,
			keys: [
				'item'
			]
		};

		// Instantiate Fuse, do the search
		var fuse = new Fuse( magic, fuseOptions );

		let results = fuse.search( query );

		// If nothing found, quit out
		if ( ! results.length ) {

		   msg.reply( fn.formatDialogue( fn.arrayRand(dialogue.error_generic) + ' ' + fn.arrayRand(dialogue.error_item_not_found) ) );

		   return;
		}

		var result = results[0].item;

		var formula = result.price.replace("×","*");

		console.log( result );

		(async (url) => {

			var response = await fn.getScript(url);

			response = JSON.parse( response );

			var reply = fn.formatDialogue( fn.arrayRand( dialogue.evaluation ), [ result.item, response.result.toLocaleString() ] );

			if ( parseInt(response.result) > parseInt(result.dmpg.toString().replace(',','')) / 2 ) {
				reply += ' You sense this is offer is above average.';
			} else if ( parseInt(response.result) < parseInt(result.dmpg.toString().replace(',','')) / 2 ) {
				reply += ' You sense this is offer is below average.';
			} else {
				reply += ' You sense this is a reasonable offer.';
			}

			msg.reply( reply + ' Please deduct the 25gp appraisal fee from your inventory.' );

		})(`https://rolz.org/api/?${formula}.json`);

	},
};
