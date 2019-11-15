module.exports = {
	name: '!safeword',
	description: 'Use this command to notify the channel if you’re feeling overwhelmed.',
	execute(msg, args, embed) {

		msg.delete();

		embed.setTitle('Note: A user just used the safe word')
			.setColor(0xf6e58d)
			.setDescription( 'Please be respectful and draw this conversation to a close. If you’d like to debrief, please feel free to do so over in #the-feels. If anything needs resolving, please notify a @dm.' )
			.setFooter( 'This was called via the !safeword command. The message calling the command has been deleted.' );

		msg.channel.send( embed );

	},
};
