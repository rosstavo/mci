module.exports = {
	name: '!weather',
	description: 'This command returns how foggy it is.',
	execute(msg, args, embed) {

		var weather = [
			'foggy',
			'very foggy',
			'like pea soup',
			'just like yesterday… foggy',
			'misty, very thick mist. Like fog',
		];

		var today = weather[Math.floor(Math.random()*weather.length)];

		embed.setTitle('What\'s the weather like today?')
			.setColor(0xBBBBBB)
			.setDescription( `The weather in the Loamy Cape today is ${today}.` );

		msg.channel.send( embed );

	},
};
