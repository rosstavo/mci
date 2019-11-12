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
});

/**
 * On a new message, perform a command if it exists
 */
bot.on('message', msg => {

    if ( msg.author.id === bot.user.id ) {
        return;
    }

    const args = msg.content.split(/ +/);
    var command = args.shift().toLowerCase();

    if ( msg.channel.id === '643803011331784725' ) {
        command = '!request';
    }

    console.info(`Called command: ${command}`);

    // If command does not exist, return
    if (!bot.commands.has(command)) return;

    var embed = new RichEmbed();

    // Try performing the command
    try {
        bot.commands.get(command).execute(msg, args, embed);
    } catch (error) {
        console.error(error);
        msg.reply('There was an error trying to execute that command!');
    }
});
