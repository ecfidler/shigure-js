// Package imports
const { Client, Intents } = require("discord.js");

// Custom imports
const auth = require("./auth.json");
const commandManager = require("./utilities/command-manager");
const { GUILDS } = require("./utilities/constants");
const { joinSauceEmporiumEvent } = require("./events/joinSauceEmporium");
const { toggleRoleButtonEvent } = require("./events/toggleRoleButton");

// Client Instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

// On ready
client.once("ready", () => {
    console.log("Good Morning!");

    // Load commands
    commandManager.loadCommands(client);

    // Set presence
    client.user.setPresence({
        activities: [{ type: "LISTENING", name: "the rain" }],
    });
});

client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
        commandManager.commandImports
            .get(interaction.commandName)
            .action(client, interaction);
    }

    if (interaction.isContextMenu()) {
        commandManager.commandImports
            .get(interaction.commandName)
            .action(client, interaction);
    }

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("toggleRoleButton_")) {
            // pass the interaction into a function to sort out the issues
            toggleRoleButtonEvent(client, interaction);
        }
    }
});

client.on("guildMemberAdd", member => {
    if (member.guild.id == GUILDS.YONI) {
        joinSauceEmporiumEvent(member);
    }
});

// Login
client.login(auth.token);
