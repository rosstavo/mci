module.exports = {
    name: 'list',
    aliases: [
        'list',
    ],
    description: 'This command works with the broker.',
    execute(msg, args, embed) {

        /**
         * We're using this command asynchronously, so we need to wrap it all in
         * a promise. At least, I think we need to. I haven't done a lot of work
         * with async functions before.
         */
        return new Promise((resolve, reject) => {

            const fn = require('../functions.js');
            const Papa = require('papaparse');

            /**
             * Get the dialogue
             */
            const dialogue = require('../data/dialogue.json');


            /**
             * Reply with loading message, then do all the restocking work
             */
            msg.reply(fn.formatDialogue(fn.arrayRand(dialogue.loading))).then(msg => (async (url) => {

                /**
                 * Get the Google Sheet
                 */
                let csv = await fn.getScript(url);

                /**
                 * If we can't find it, something's gone really wrong, so let's
                 * just throw an error.
                 */
                if (!csv) {
                    throw new Error('Can’t find the CSV.');
                }

                /**
                 * Parse google sheet
                 */
                let data = Papa.parse(csv, {
                    "header"       : true,
                    "dynamicTyping": true
                });

                /**
                 * Create a string that we'll add all our gems to
                 */
                let gemsList = [];


                for (let gem of data.data) {

                    let gemName = gem.item;

                    if ( gem.component ) {
                        gemName += '*';
                    }

                    let gemString = `${gemName}\n${process.env.COIN} \`${gem.avg} gp\``;

                    gemsList.push(gemString);
                }

                let fields = [];

                while (gemsList.length) {
                    fields.push(gemsList.splice(0, 20));
                }

                for (let field of fields) {
                    embed.addField('—', field.join('\n\n'), true);
                }

                embed.setTitle( 'Standard Gem Valuations' );

                embed.setDescription( 'The list below shows a complete list of gems discovered on the Loamy Cape, and a valuation for an A grade specimen.' );

                embed.addField( '—', '* This gem is a named spell component.' );

                msg.channel.send(embed);

                /**
                 * Resolve the promise
                 */
                resolve(true);

            })(process.env.GEMS));

        });


    },
};
