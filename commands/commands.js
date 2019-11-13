module.exports = {
	name: '!commands',
	description: 'This command lists commands.',
	execute(msg, args, embed) {

		embed.setTitle( 'List of commands' )
			.setColor(0xBBBBBB)
			.addField( '!commands', 'This is the command you just did.' )
			.addField( '!day', 'Returns the in-Universe day.' )
			.addField( '!weather', 'Is it foggy? Try this command and see!' )
			.addField( '!dice', 'Forgotten how to roll with advantage? This’ll give you the lowdown.' )
			.addField( '!safeword', 'For when things get too real. Use this command to notify the channel if you’re feeling overwhelmed. Your message will be deleted so anyone revisiting the conversation will not know who called timeout.' );

        msg.channel.send( embed );

	},
};
