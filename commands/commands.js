module.exports = {
	name: '!commands',
	description: 'This command lists commands.',
	execute(msg, args, embed) {

		embed.setTitle( 'List of directives' )
			.addField( '!character <character>', 'This directive returns intelligence on a specific player-directed inhabitant.' )
			.addField( '!day', 'This directive returns the breather terminology for the current period in the 7-day cycle.' )
			.addField( '!dice', 'This directive provides training on correct syntax for random number generation via the rolling of dice.' )
			.addField( '!downtime <activity (optional)>', 'This directive returns an overview of the various activities users can undertake between missions.' )
			.addField( '!safeword', 'This directive notifies the channel if the user is feeling overwhelmed. The user’s message will be deleted so any user revisiting the conversation will not know who called timeout.' )
			.addField( '!status', 'This directive returns the current status of Intel. Officer DSGN. ‘Helper’.' )
			.addField( '!weather', 'This directive provides an analysis of the present meteorological phenomena.' );

        msg.channel.send( embed );

	},
};
