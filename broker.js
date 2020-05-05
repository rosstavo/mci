/**
 * Get the environment config
 */
require('dotenv').config();
const fn   = require('./functions.js');
const Fuse = require('fuse.js');

const dialogue = require('./dialogue.json');

/**
 * Set up the client
 */
const Discord = require('discord.js');

const { Client, RichEmbed, Message } = require('discord.js');

const bot = new Client();
const message = new Message();

/**
 * Create a new collection for commands
 */
bot.commands = new Discord.Collection();

/**
 * Import commands from external file and map to array
 */
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

/**
 * Connect to server
 */
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

/**
 * Log in the console when the bot is online
 */
bot.on('ready', () => {

    console.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setPresence({
        game: {
            name: '#broker',
            type: "LISTENING"
        }
    });

    var embed = fn.formatEmbed( new RichEmbed() );

    embed.setTitle( 'The Broker is open for business.' );

    // bot.channels.get( process.env.LOGS ).send( embed );
});

/**
 * On a new message, perform a command if it exists
 */
bot.on('message', message => {

    const args = message.content.split(/ +/);

    if ( message.channel.id !== process.env.BROKER && message.channel.type === 'text' ) {

        if ( ! message.isMemberMentioned( bot.user ) ) {
            return;
        } else {
            args.shift();
        }

    }

    if ( message.author.id === bot.user.id ) {
        return;
    }

    if ( message.content.replace(/ *\[[^\]]*]/g, "") === '' ) {
        return;
    }

	let commandName = args.shift().toLowerCase();

	let command = bot.commands.get(commandName);

    if ( ! command ) {

        // Options for Fuse
        var fuseOptions = {
            shouldSort: true,
            includeScore: true,
            threshold: 0.5,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            findAllMatches: true,
            keys: [
                'aliases'
            ]
        };

        // Instantiate Fuse, do the search
        var fuse = new Fuse( Array.from( bot.commands.values() ), fuseOptions );

        var results = fuse.search(message.content);

        if ( results.length ) {
            command = bot.commands.get(results[0].item.name);
        }

    }

    var embed = fn.formatEmbed( new RichEmbed() );

    // Try performing the command
    try {
        command.execute(message, args, embed);
    } catch (error) {
        console.error(error);
        message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));
    }
});
