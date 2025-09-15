import { ApplicationCommandType, MessageFlags } from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { GUILDS } from "../utilities/constants";
import { renderRoleChooser } from "../utilities/roleChooser/renderRoleChooser";

export const guild = GUILDS.GLOBAL;

export const commandData: CommandData = {
    description:
        "Opens a menu to allow you to add or remove roles from yourself",
    type: ApplicationCommandType.ChatInput,
};

export async function action({ client, interaction }: CommandArgs) {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (!client.isReady()) {
        return;
    }

    if (interaction.guild.id !== GUILDS.WHID) {
        await interaction.reply({
            content: "'roleup' is not availible in this server, sorry.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const components = await renderRoleChooser(client, interaction);

    await interaction.reply({
        components: components,
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
}
