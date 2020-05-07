module.exports = {
	name: 'help',
	aliases: [
		'help',
	],
	description: 'This command works with the broker.',
	execute(msg, args, embed) {

		const fn   	   = require('../functions.js');
		const dialogue = require('../dialogue.json');

		msg.reply( fn.formatDialogue( fn.arrayRand( dialogue.help_generic ) + ' ' + fn.arrayRand( dialogue.help_flavour ) ) );

	},
};
