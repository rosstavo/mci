/**
 * Get the environment config
 */
require('dotenv').config();

const fn = require('./functions.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const fsPromises = fs.promises;
const shuffleSeed = require('shuffle-seed');
const Papa = require('papaparse');

const dialogue = require('./data/dialogue.json');

/**
 * Set up the client
 */
const Discord = require('discord.js');

const {
    Client,
    RichEmbed,
    Message
} = require('discord.js');

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
            name: '#mineral-creek-initiative',
            type: "LISTENING"
        }
    });

    /**
     * Get the current time UTC
     */
    let d = new Date(new Date().toUTCString());

    /**
     * When the bot starts up, if it's changeover time, restock
     */
    if (d.getHours() > 0 || d.getMinutes() > 5) {
        return;
    }

    let embed = fn.formatEmbed(new RichEmbed());

    bot.channels.get(process.env.MCI).send('The Mineral Creek Initiative is open for business.').then(async message => {

        try {
            await bot.commands.get('restock').execute(message, [], embed);
        } catch (error) {
            console.error(error);
            message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));
        }

        /**
         * Display the new stock
         */
        bot.commands.get('stock').execute(message, [], embed);

    });

});

/**
 * On a new message, perform a command if it exists
 */
bot.on('message', async message => {

    /**
     * We may want to define the commandName in the future, but not right now.
     */
    let commandName = false;

    /**
     * If we're not in the right channel, leave
     */
    if (!commandName && message.channel.id !== process.env.MCI && message.channel.type === 'text') {
        return;
    }

    /**
     * If the message doesn't mention the bot, leave
     */
    if (!commandName && !message.mentions.users.has(bot.user.id) && message.channel.type === 'text') {
        return;
    }

    /**
     * If the message comes from the bot, leave
     */
    if (message.author.id === bot.user.id) {
        return;
    }

    /**
     * Setup some variables we're going to use later
     */
    let today = new Date(new Date().toUTCString());
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let embed = fn.formatEmbed(new RichEmbed());
    let npc = today.getHours() > 12 ? 'Helen Stoneriver' : 'Quinten Xhalore';

    /**
     * Notify the channel who's behind the desk
     */
    await message.channel.send(`${npc} is behind the desk.`);

    /**
     * Get our stock values
     */
    let stock = await JSON.parse(fs.readFileSync('./data/stock.json'));

    /**
     * If the stock date isn't today, we need new stock. This only fires if
     * something's gone wrong with the CRON job.
     */
    if (typeof stock.date === 'undefined' || stock.date !== date) {

        try {
            await bot.commands.get('restock').execute(message, {}, embed);
        } catch (error) {
            console.error(error);
            message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));
        }

    }

    /**
     * Let's process the message
     */
    let args = message.content.split(/ +/);

    /**
     * Remove tags and non-alphanumerics
     */
    args = args.filter(arg => {
        return !arg.match(/<[^>]*>/g);
    }).map(arg => {
        return arg.replace(/[^A-Za-z0-9]/g, '');
    });

    /**
     * If commandName hasn't been set and we have args, let's create a new
     * commandName variable
     */
    if (!commandName && args.length) {
        commandName = args.shift().toLowerCase();
    }

    /**
     * Search our bot commands for the command
     */
    let command = bot.commands.get(commandName);

    /**
     * If we can't find it, do a Fuse search of the aliases
     */
    if (!command) {

        let fuse = new Fuse(Array.from(bot.commands.values()), {
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
        });

        let results = fuse.search(message.content);

        if (results.length) {
            command = bot.commands.get(results[0].item.name);
        }

    }

    /**
     * Guild members shouldn't be able to fire the restock command via messages
     */
    if (command.name === 'restock') {
        message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));

        return;
    }

    /**
     * After all that, try performing the command
     */
    try {
        command.execute(message, args, embed);
    } catch (error) {
        console.error(error);
        message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));
    }

});
