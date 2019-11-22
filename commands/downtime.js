module.exports = {
	name: '!downtime',
	description: 'This command shows downtime activities.',
	execute(msg, args, embed) {

		var activities = {
			"working": {
				"title": "Working",
				"description": "You may decide your character has a job with one of the many businesses in the Loamy Cape. Any day spent working, you can make a check with a relevant skill (determined by the DM). To find out the amount of money you earned in gold, subtract 15 from the roll (minimum result 1)."
			},
			"foraging": {
				"title": "Foraging",
				"description": "The Loamy Cape has plenty of resources available for foraging, that you could either sell or use in crafting potions. To see how successful your foraging is, make a Wisdom (Survival) check. The values in the table below represent a single day spent foraging. If you are foraging for a specific ingredient, its rarity is determined by the DM. (If crafting, this would likely correspond to the rarity of the item being crafted.) Otherwise, you can sell the resources at a fifth of their crafting worth.",
				"image": "https://liturgistsrpg.com/imgs/foraging.png"
			},
			"crafting": {
				"title": "Crafting",
				"description": "If your character has the relevant proficiencies, they can craft items in their downtime. We are using the crafting rules from *[Xanathar’s Guide To Everything](https://www.dndbeyond.com/sources/xgte/downtime-revisited#CraftinganItem)*.\n\nIn addition to these rules, you can craft specific magical items without the formula if you have a gem filled with the essence of a sufficiently powerful creature. The resulting item is determined by the DM, based on your crafting roll, and will have an enchantment with a thematic tie to the creature.\n\nPlease tag a DM if you’d like to undertake some crafting."
			},
			"inspiring": {
				"title": "Inspiring",
				"description": "It may be that your character has a particular knack for inspiring other people, either through the quality of their words, or art, or compassion. To determine how inspiring you are on a particular day, make a relevant skill check (determined by the DM). If the result is above 20, you gain a point of Inspiration for your next session, which you can use to gain advantage on any roll. There is no limit to the number of days on which you can attempt this, but you can only have one point of Inspiration at a time."
			},
			"hunting": {
				"title": "Hunting",
				"description": "There are a variety of animals to hunt in the Loamy Cape and beyond. The instructions below are for a single day spent hunting. To determine how successful your hunt is, make two rolls, the first of which is a Wisdom (Survival) check to find tracks.\n\n**Roll – Result**\n0 or above - No tracks found\n10 or above - Found Common creature tracks\n15 or above - Found Uncommon creature tracks\n20 or above - Found Rare creature tracks\n25 or above - Found Very Rare creature tracks\n30 or above - Found Legendary creature tracks\n\nOnce you’re on the trail of a creature, in order to kill it, make a special Dexterity (Hunting) check, where you can add your proficiency bonus if you have a proficiency with any ranged weapon. The DC of the roll corresponds to the creature’s armor class, which depends on its rarity, per the table below.\n\n**Rarity – DC/AC**\nCommon – 5\nUncommon – 10\nRare – 15\nVery Rare – 20\nLegendary – 25\n\nIf you manage to hit the creature with your attack, you succeed in killing it, otherwise it is spooked and runs away.\n\nYou can retain the parts harvested from the creature for use in crafting, or you can sell the parts to one of the institutions in the Loamy Cape. Below is a guide for the amount of gold earned.\n\n**Rarity – Worth**\nCommon – 5 gp\nUncommon – 10 gp\nRare – 25 gp\nVery Rare – 50 gp\nLegendary – 100 gp"
			},
			"pitfighting": {
				"title": "Pit Fighting",
				"description": "Pit fighting includes boxing, wrestling, and other nonlethal forms of combat in an organized setting with predetermined matches. The character must make a series of checks, with a DC determined at random based on the quality of the opposition that the character runs into. A big part of the challenge in pit fighting lies in the unknown nature of a character’s opponents.\n\nThe character makes three checks: Strength (Athletics), Dexterity (Acrobatics), and a special Constitution check that has a bonus equal to a roll of the character’s largest Hit Die (this roll doesn’t spend that die). If desired, the character can replace one of these skill checks with an attack roll using one of the character’s weapons. The DC for each of the checks is 5 + 2d10; generate a separate DC for each one (you can do this automatically by typing `!pitfighting`, but do this after your three rolls, otherwise it may influence your decision about whether to use an attack roll or not). Consult the table below to see how the character did.\n\n**Result – Value**\n0 successes – Lose your bouts, earning nothing\n1 success – Win 12.5 gp\n2 successes – Win 20 gp\n3 successes – Win 40 gp"
			},
			"training": {
				"title": "Training",
				"description": "You can spend time between adventures learning a new proficiency. The training lasts for 10 weeks reduced by a number of weeks equal to your Intelligence modifier, and absorbs your passive income. After you spend the requisite amount of time and money, you gain the new proficiency.\n\n**Eureka Moments.** Every day you spend training, you can roll a d20. On a 20, you have a eureka moment, and your learning advances 2 weeks."
			},
		};

		if ( ! args.length ) {

			embed.setTitle( 'Achieving goals between sessions' )
				.setDescription( 'Our game happens in approximately real-time, which means there can be days or weeks at a time between sessions, during which you may want to achieve some goals as your character. These downtime activities are available for all players, whether you participate in the text RP or not. Each activity (apart from Crafting) takes a day to complete.' )
				.addField( 'Passive income', 'Every day your character earns one gold piece through their activities. You can either add this as you go along, or calculate the total earned at the start of your next session. The DM can inform you of how many days it has been for your calculations, or you can use the command `!player <character>`.' )
				.addField( 'Daily activities', 'Instead of taking passive income on any day, you can instead do one of the following activities (or anything else agreed with the DM). These rules are designed so that you can do simple tasks independently. If anything you’re trying to achieve falls outside of this remit, tag a DM.' )
				.addField( 'Working', '`!downtime working`', true )
				.addField( 'Foraging', '`!downtime foraging`', true )
				.addField( 'Crafting', '`!downtime crafting`', true )
				.addField( 'Inspiring', '`!downtime inspiring`', true )
				.addField( 'Hunting', '`!downtime hunting`', true )
				.addField( 'Pit Fighting', '`!downtime pitfighting`', true )
				.addField( 'Training', '`!downtime training`', true )
				.addBlankField( true );

		} else {

			embed.setTitle( 'No activity found' );

			if ( activities[args[0]] ) {

				embed.setTitle( `Daily Activity: ${activities[args[0]]['title']}` )
					.setDescription( activities[args[0]]['description'] );

				if ( activities[args[0]]['image'] ) {
					embed.setImage( activities[args[0]]['image'] );
				}

			}

		}

        msg.channel.send( embed );

	},
};
