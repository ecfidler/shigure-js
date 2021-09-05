// Package imports
const { Client, Intents } = require('discord.js');

// Custom imports
const auth = require('./auth.json');
const commandManager = require("./utilities/command-manager");

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
});

// Login
client.login(auth.token);