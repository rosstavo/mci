module.exports = {
	name: '!status',
	aliases: ['!statusreport'],
	description: 'This command displays Helper’s current status.',
	execute(msg, args, embed) {

		const getScript = (url) => {
			return new Promise((resolve, reject) => {
				const http      = require('http'),
					  https     = require('https');

				let client = http;

				if (url.toString().indexOf("https") === 0) {
					client = https;
				}

				client.get(url, (resp) => {
					let data = '';

					// A chunk of data has been recieved.
					resp.on('data', (chunk) => {
						data += chunk;
					});

					// The whole response has been received. Print out the result.
					resp.on('end', () => {
						resolve(data);
					});

				}).on("error", (err) => {
					reject(err);
				});
			});
		};

		// Giphy API defaults
		const giphy = {
			baseURL: "https://api.giphy.com/v1/gifs/",
			apiKey: "2iZ2VootxkPQFWDOpKFhAuwFEEbMc0MO",
			tag: "robot",
			type: "random",
			rating: "pg-13"
		};

		// Giphy API URL
		let giphyURL = encodeURI(
			giphy.baseURL +
				giphy.type +
				"?api_key=" +
				giphy.apiKey +
				"&tag=" +
				giphy.tag +
				"&rating=" +
				giphy.rating
		);


		(async (url) => {

			var gif = await getScript(url);

			embed.setImage( JSON.parse(gif).data.image_original_url );

			msg.channel.send( embed );

		})(giphyURL);

	},
};
