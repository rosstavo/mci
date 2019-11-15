/**
 * Get the environment config
 */
require('dotenv').config();

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
    bot.user.setPresence({ game: { name: '&commands', type: "LISTENING" }})
});

/**
 * On a new message, perform a command if it exists
 */
bot.on('message', message => {

    if ( message.author.id === bot.user.id ) {
        return;
    }

	const args = message.content.split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

    console.log( command );

    var embed = new RichEmbed();

    // Try performing the command
    try {
        command.execute(message, args, embed);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});
