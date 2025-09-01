import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { auth } from "./auth";
import { changeRolesCategoryEvent } from "./events/changeRolesCategory";
import { changeRolesPageEvent } from "./events/changeRolesPage";
import { joinSauceEmporiumEvent } from "./events/joinSauceEmporium";
import { toggleRoleButtonEvent } from "./events/toggleRoleButton";
import { commandModuleByName, loadCommands } from "./utilities/command-manager";
import { GUILDS } from "./utilities/constants";
import { CHANGE_ROLES_CATEGORY_EVENT_ID } from "./utilities/roleChooser/constants";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("clientReady", readyClient => {
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
                console.error(
                    "Interaction in uncached guild received",
                    interaction.guildId,
                    interaction
                );
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
                    return;
                }

                if (interaction.customId.startsWith("changeRolesPage_")) {
                    changeRolesPageEvent({ client, interaction });
                    return;
                }
            }

            if (interaction.isStringSelectMenu()) {
                if (
                    interaction.customId.startsWith(
                        CHANGE_ROLES_CATEGORY_EVENT_ID
                    )
                ) {
                    changeRolesCategoryEvent({ client, interaction });
                    return;
                }
            }

            console.error("Unknown interaction received:", interaction);
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
