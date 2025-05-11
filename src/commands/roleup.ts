import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Colors,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { GUILDS } from "../utilities/constants";
import { isMemberCached } from "../utilities/isMemberCached";
import { getRoles } from "../utilities/roleup";
import { getPaginatedRoleSelectionMessage } from "../utilities/roles/getPaginatedRoleSelectionMessage";

export const guild = GUILDS.GLOBAL;

export const commandData: CommandData = {
    description:
        "Opens a menu to allow you to add or remove roles from yourself",
    options: [
        {
            name: "category",
            description: "The category of roles that you wish to choose from",
            choices: [
                {
                    name: "Interests",
                    value: "interests",
                },
                {
                    name: "Languages",
                    value: "languages",
                },
                {
                    name: "Schools",
                    value: "schools",
                },
            ],
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
};

export const roleMenuHeader = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setAuthor({
        name: "Click on a grey role to add it, click on a green role to remove it!",
    }); // TODO: add author icon?

export async function action({ client, interaction }: CommandArgs) {
    if (
        !interaction.isChatInputCommand() ||
        interaction.guildId == null ||
        interaction.guild == null ||
        interaction.options == null ||
        interaction.member == null ||
        !isMemberCached(interaction.member)
    ) {
        return;
    }

    if (interaction.guild.id !== GUILDS.WHID) {
        await interaction.reply({
            content: "'roleup' is not availible in this server, sorry.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const category = interaction.options.get("category")?.value;
    if (category == null) {
        await interaction.reply({
            content: "Please choose a category",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const roleData = await getRoles(
        client,
        category.toString(),
        interaction.guild
    );
    const rows = getPaginatedRoleSelectionMessage(
        roleData,
        interaction.member,
        category.toString(),
        0
    );

    await interaction.reply({
        embeds: [roleMenuHeader],
        components: rows,
        flags: MessageFlags.Ephemeral,
    });
}
