module.exports = {
	name: '!xp',
	aliases: ['!session'],
	description: 'This command displays information about the previous session.',
	execute(msg, args, embed) {

		const Papa      = require( 'papaparse' );
		const functions = require( '../functions.js' );


		(async (url) => {

			var csv = await functions.getScript(url);

			var data = Papa.parse( csv, {
				"header": true
			} );

			msg.delete();

			var headerRow = Object.keys(data.data[0]);

			var cols = headerRow.slice( headerRow.indexOf('Starting') + 1, headerRow.length + 1 );

			var sessions = cols.filter( function(el) {
				return el.match(/^\d/);
			} );

			var lastSession = headerRow[headerRow.length-1];

			if ( args.length && args[0] === 'latest' ) {

				embed.setTitle( `Session #${sessions.length} – XP` );

				var session = data.data.filter( function(el) {
					return el['Last Session'] == 'TRUE';
				} );

				for (i = 0; i < session.length; i++) {
					embed.addField(
						session[i]['Player'],
						`<@${session[i]['Discord']}>\nLevel ${session[i]['Level']}\n${session[i]['XP']} XP (${session[i][lastSession]})`,
						true
					);
				}

				for (i = 0; i < session.length; i++) {

					if (session[i]['Level Up'] !== 'TRUE') {
						continue;
					}

					embed.addField(
						'Level Up!',
						`${session[i]['Player']} <@${session[i]['Discord']}> has advanced to Level ${session[i]['Level']} after surpassing ${session[i]['Previous level']} Experience Points! <a:partywizard:622295086658748438>`,
						false
					);
				}

			} else {

				embed.setTitle('XP Totals')
					.setDescription( `As of session #${sessions.length}:`);

				const grouped = functions.groupBy( data.data, row => row['Level'] );

				for (const [level, rows] of grouped) {

					var content = '';

					rows.forEach( function (row, index) {

						var remainingXP = parseInt(row['Next level'].replace(/,/g, '')) - parseInt(row['XP'].replace(/,/g, ''));

						if ( row['Player'] !== '' ) {
							content = content + `${row['Player']} – ${row['XP']} XP (-${remainingXP})\n`;
						}

					} );

					embed.addField( `[Level ${level}]`, content, false );

				}

			}

			msg.channel.send( embed );

		})('https://docs.google.com/spreadsheets/d/e/2PACX-1vSqpxsbFeZKV9pdjgOJMpJsCow468WvYpkYavx1IP-ZM1CNglyLvI6CefFFFrpPU05BOQ1FveBrEnNS/pub?gid=1816805129&single=true&output=csv');

	},
};
