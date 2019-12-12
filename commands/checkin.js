module.exports = {
	name: '!checkin',
	description: 'Use this command to notify the channel if you want to do a group check-in.',
	execute(msg, args, embed) {

		msg.delete();

		embed.setTitle('Note: A user just suggested a check-in')
			.setColor(0xe67e22)
			.setDescription( 'When you or someone else says something and you aren’t sure if everyone is into it or if it’s the best idea, you can call a check in with this command. This can be used in both text RP and the chat channels.\n\nIf you are participating in or spectating the conversation, please react to this message in one of the following ways:\n' )
			.addField( ':thumbsup:', 'If you think what was said was fine and doesn’t need to be revised', true )
			.addField( ':person_shrugging:', 'If you don’t know how you feel about what was said or don’t care', true )
			.addField( ':arrows_counterclockwise:', '(In RP) If you think what was said is worth revising OR (In chat) if you would like to bring the topic of conversation to a close', true )
			.setFooter( 'This was called via the !checkin command. The message calling the command has been deleted.' );

		msg.channel.send( embed ).then(function (message) {

			message.react('👍');
			message.react('🤷');
			message.react('🔄');

		} );

	},
};
