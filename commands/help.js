module.exports = {
	name: 'help',
	aliases: [
		'help',
		'help me',
		'I need help'
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const fn   	   = require('../functions.js');
		const dialogue = require('../data/dialogue.json');

		/**
		 * Send our help message
		 */
		msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.help_generic ) + ' ' + fn.arrayRand( dialogue.help_flavour ) ) );

	},
};
