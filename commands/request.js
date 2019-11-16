module.exports = {
	name: '!request',
	description: 'This command creates a request for the Dungeon Masters.',
	execute(msg, args, embed) {

		if ( msg.channel.id !== '643803011331784725' ) {
			return;
		}

		msg.delete();

		embed.setTitle(`New request from ${ msg.author.username }`)
			.setDescription( msg.content )
			.setTimestamp( msg.createdTimestamp );

        msg.channel.send( embed );

	},
};
