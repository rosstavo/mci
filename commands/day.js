module.exports = {
	name: '!day',
	description: 'This command returns the day.',
	execute(msg, args, embed) {

		const util = require('util');

		var days = require('../days.json');

		var dt = new Date();

		var day = dt.getDay();

		if ( args.length ) {
			day = args[0];
		}

		var english = days[day].english;

		var morning = days[day].morning.join( ' OR ' );

		var evening = days[day].evening.join( ' OR ' );

		embed.setTitle('What day is it today?')
			.setDescription( util.format( 'Today (%s), the daylight hours are named %s. Once the Sun has set, the night is named %s.', english, morning, evening ) );

		msg.channel.send( embed );
	},
};
