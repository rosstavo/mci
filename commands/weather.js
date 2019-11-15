module.exports = {
	name: '!weather',
	description: 'This command returns how foggy it is.',
	execute(msg, args, embed) {

		var weather = [
			'The weather in the Loamy Cape today is foggy.',
			'The weather in the Loamy Cape today is very foggy.',
			'The weather in the Loamy Cape today is like pea soup.',
			'The weather in the Loamy Cape today is just like yesterday… foggy.',
			'The weather in the Loamy Cape today is misty, very thick mist. Like fog.',
			'It’s a beautiful day, but you can’t tell because of all the fog.',
			'Today’s weather has been cancelled due to abyssal fog all over the damn place. Replacement wind and rain services are unavailable.',
			'Yeah, it’s still foggy.',
			'Did someone spill grey paint on your glasses? Nope, that’s just the fog.',
			':fog::fog::fog::fog::fog:',
		];

		var today = weather[Math.floor(Math.random()*weather.length)];

		embed.setTitle('What\'s the weather like today?')
			.setColor(0xf2edd8)
			.setDescription( today );

		msg.channel.send( embed );

	},
};
