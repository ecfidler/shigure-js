// Package imports
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

// Custom imports
const auth = require("./auth.json");
const commandManager = require("./utilities/command-manager");
const { GUILDS } = require("./utilities/constants");
const { joinSauceEmporiumEvent } = require("./events/joinSauceEmporium");
const { toggleRoleButtonEvent } = require("./events/toggleRoleButton");
const { changeRolesPageEvent } = require("./events/changeRolesPage");

// Client Instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// On ready
client.once("ready", () => {
    console.log("Good Morning!");

    // Load commands
    commandManager.loadCommands(client);

    // Set presence
    client.user.setPresence({
        activities: [{ type: ActivityType.Listening, name: "the rain" }],
    });
});

client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
        commandManager.commandByCommandName
            .get(interaction.commandName)
            .action({ client, interaction });
        return;
    }

    if (interaction.isContextMenuCommand()) {
        commandManager.commandByCommandName
            .get(interaction.commandName)
            .action({ client, interaction });
        return;
    }

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("toggleRoleButton_")) {
            // pass the interaction into a function to sort out the issues
            toggleRoleButtonEvent({ client, interaction });
        } else if (interaction.customId.startsWith("changeRolesPage_")) {
            changeRolesPageEvent({ client, interaction });
        }
        return;
    }
});

client.on("guildMemberAdd", member => {
    if (member.guild.id == GUILDS.YONI) {
        joinSauceEmporiumEvent(member);
    }
});

// Login
client.login(auth.token);
