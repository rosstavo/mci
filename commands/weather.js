module.exports = {
	name: '!weather',
	description: 'This command returns how foggy it is.',
	execute(msg, args, embed) {

		const functions = require('../functions.js');

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
			.setDescription( today );

		msg.channel.send( embed ).then( message => ( async () => {

			var data = await functions.getScript( `http://api.openweathermap.org/data/2.5/weather?lat=38.167795&lon=-122.331556&appid=${process.env.OPENWEATHER}`);

			var parsedData = JSON.parse(data);

			var fahrenheit = Math.round( ( parsedData.main.temp * 9 ) / 5 - 459.67 );

			var celsius = Math.round( parsedData.main.temp - 273.15 );

			embed.addField( 'Temperature', `It's ${fahrenheit}°F / ${celsius}°C outside.` );

			message.edit(embed);

		} )( ) );

	},
};
