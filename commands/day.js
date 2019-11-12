module.exports = {
	name: '!day',
	description: 'This command returns the day.',
	execute(msg, args, embed) {

		var days = [
			[
				'Sunday',
				'Morgsmorn',
				'Kvertzeve',
			],
			[
				'Monday',
				'Kvertzmorn',
				'Dvargseve',
			],
			[
				'Tuesday',
				'Dvargsmorn',
				'Fixeve',
			],
			[
				'Wednesday',
				'Fixmorn',
				'Blixeve',
			],
			[
				'Thursday',
				'Blixmorn',
				'Kraxeve',
			],
			[
				'Friday',
				'Kraxmorn',
				'Voxeve',
			],
			[
				'Saturday',
				'Voxmorn',
				'Morgseve OR Weexeve',
			],
		];

		var dt = new Date();

        msg.channel.send( `Today (${days[dt.getDay()][0]}), the daylight hours are named ${days[dt.getDay()][1]}. Once the Sun has set, the night is named ${days[dt.getDay()][2]}.` );

	},
};
