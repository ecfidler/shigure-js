import { auth } from "./auth";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { commandModuleByName, loadCommands } from "./utilities/command-manager";
import { GUILDS } from "./utilities/constants";
import { joinSauceEmporiumEvent } from "./events/joinSauceEmporium";
import { toggleRoleButtonEvent } from "./events/toggleRoleButton";
import { changeRolesPageEvent } from "./events/changeRolesPage";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", readyClient => {
    console.log("Good Morning!");

    // Load commands
    loadCommands(readyClient);

    // Set presence
    readyClient.user.setPresence({
        activities: [{ type: ActivityType.Listening, name: "the rain" }],
    });
});

client.on("interactionCreate", interaction => {
    (async () => {
        try {
            if (!interaction.inCachedGuild()) {
                return;
            }

            if (interaction.isCommand()) {
                await commandModuleByName
                    .get(interaction.commandName)
                    ?.action({ client, interaction });
                return;
            }

            if (interaction.isButton()) {
                if (interaction.customId.startsWith("toggleRoleButton_")) {
                    toggleRoleButtonEvent({ client, interaction });
                } else if (
                    interaction.customId.startsWith("changeRolesPage_")
                ) {
                    changeRolesPageEvent({ client, interaction });
                }
                return;
            }
        } catch (error) {
            console.error("Error handling interaction:", error);
        }
    })();
});

client.on("guildMemberAdd", member => {
    if (member.guild.id === GUILDS.YONI) {
        joinSauceEmporiumEvent(member);
    }
});

client.login(auth.DISCORD_TOKEN);
