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

const dialogue = require('./dialogue.json');

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

    let d = new Date(new Date().toUTCString()); // current time UTC

    if (d.getHours() > 0 || d.getMinutes() > 5) {
        return;
    }

    let embed = fn.formatEmbed(new RichEmbed());

    bot.channels.get(process.env.MCI).send('The Mineral Creek Initiative is open for business.').then(message => {

        bot.commands.get('stock').execute(message, [], embed);

    });

});

/**
 * On a new message, perform a command if it exists
 */
bot.on('message', message => {

    let today = new Date(new Date().toUTCString());
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    let commandName = false;

    if (!commandName && message.channel.id !== process.env.MCI && message.channel.type === 'text') {
        return;
    }

    if (!commandName && !message.mentions.users.has(bot.user.id) && message.channel.type === 'text') {
        return;
    }

    if (message.author.id === bot.user.id) {
        return;
    }

    let npc = 'Quinten Xhalore';

    if ( today.getHours() > 12 ) {
        npc = 'Helen Stoneriver';
    }

    message.channel.send( `${npc} is behind the desk.` );

    async function stockCheck() {

        if (typeof stock.date === 'undefined' || stock.date !== date) {
            message.reply( fn.formatDialogue( fn.arrayRand( dialogue.loading ) ) );

            return await fn.getScript('https://docs.google.com/spreadsheets/d/e/2PACX-1vTYQa-Tc32vE1mN1V26HiTN8xyJzzczgzXcykynyuqQahqLqgCyGn-7IwwmgBto9JE7MTRH0ETP7OmX/pub?gid=1177386660&single=true&output=csv');
        }

        return false;
    }

    let stock = JSON.parse(fs.readFileSync('./stock.json'));

    stockCheck().then( csv => {

        if ( csv ) {

            /**
             * Parse player spreadsheet
             */
            let data = Papa.parse(csv, {
                "header": true
            });

            let newStock = [];

            let seed = Math.floor((today - new Date(process.env.STARTDATE)) / (24 * 60 * 60 * 1000));

            let gems = shuffleSeed.shuffle(data.data, seed).slice(0, 6);

            for (let i = 0; i < 6; i++ ) {

                let gems = shuffleSeed.shuffle(data.data, seed + `-${i}`);

                let price = fn.rollDice(gems[0].diceqty, gems[0].die) * gems[0].multiplier;

                let cr = fn.getCR(price)

                newStock.push({
                    "item"       : gems[0].item,
                    "description": gems[0].description,
                    "rarity"     : fn.getGemRarity(cr),
                    "price"      : price,
                    "size"       : fn.getGemSize(price, gems[0].diceqty * gems[0].multiplier, gems[0].diceqty * gems[0].die * gems[0].multiplier),
                    "cr"         : cr,
                    "qty"        : 1,
                    "type"       : "Gem"
                });

            }

            stock.items = newStock.sort(fn.compareValues('price'));

            let magic = require('./magic.json');

            let formulae = shuffleSeed.shuffle(magic, seed).filter( item => {

                if ( item['Type'] === 'Spell Scrolls' ) {
                    return false;
                }

                if ( item['exclude'] ) {
                    return false;
                }

                return true;

            } ).slice(0, 3);

            for (let i in formulae) {

                newStock.push({
                    "item"       : 'Crafting Formula: ' + formulae[i].item,
                    "description": 'Multiple use',
                    "rarity"     : formulae[i].rarity,
                    "price"      : 200,
                    "value"      : formulae[i].avg,
                    "qty"        : 1,
                    "type"       : "Formula"
                });

            }

            stock.date = date;

            // Store stock
            try {
                fs.writeFileSync('stock.json', JSON.stringify(stock), 'utf-8', function(err) {
                    if (err) throw err;
                });
            } catch (error) {
                console.error(error);
            }

        }



        let args = message.content.split(/ +/);

        args = args.filter(arg => {
            return !arg.match(/<[^>]*>/g);
        }).map(arg => {
            return arg.replace(/[^A-Za-z0-9]/g, '');
        });

        if (args.length && !commandName) {
            commandName = args.shift().toLowerCase();
        }

        let command = bot.commands.get(commandName);

        if (!command) {

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
            var fuse = new Fuse(Array.from(bot.commands.values()), fuseOptions);

            var results = fuse.search(message.content);

            if (results.length) {
                command = bot.commands.get(results[0].item.name);
            }

        }

        var embed = fn.formatEmbed(new RichEmbed());

        // Try performing the command
        try {
            command.execute(message, args, embed);
        } catch (error) {
            console.error(error);
            message.reply(fn.formatDialogue(fn.arrayRand(dialogue.error_generic)));
        }

    } );





});
