// Package imports
const { Client, Intents } = require('discord.js');

// Custom imports
const auth = require('./auth.json');
const commandManager = require("./utilities/command-manager");
const { GUILDS } = require('./utilities/constants');
const { joinSauceEmporium } = require('./events/joinSauceEmporium');

// Client Instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

// On ready
client.once('ready', () => {
	console.log('Good Morning!');
    
    // Load commands
    commandManager.loadCommands(client);

    // Set presence
    client.user.setPresence({ activities: [{ type: "LISTENING", name: "the rain" }]});
});

client.on('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
        commandManager.commandImports.get(interaction.commandName).action(client, interaction);
    }

    if (interaction.isContextMenu()) {
        // What else do I need to add here?
        commandManager.commandImports.get(interaction.commandName).action(client, interaction);
    }
});

client.on('guildMemberAdd', (member) => {
    if (member.guild.id == GUILDS.YONI) {
        joinSauceEmporium(member);
    }

})

// Login
client.login(auth.token);