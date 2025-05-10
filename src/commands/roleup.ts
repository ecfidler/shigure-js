import {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    Colors,
    MessageFlags,
    GuildMember,
    type APIInteractionGuildMember,
} from "discord.js";
import { GUILDS } from "../utilities/constants";
import { getButtonRows, getRoles } from "../utilities/roleup";
import type { CommandArgs } from "../types/CommandArgs";
import { isMemberCached } from "../utilities/isMemberCached";

export const guild = GUILDS.GLOBAL;

export const commandData = {
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
        interaction.reply({
            content: "'roleup' is not availible in this server, sorry.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const category = interaction.options.get("category")?.value;
    if (category == null) {
        interaction.reply({
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
    const rows = getButtonRows(
        roleData,
        interaction.member,
        category.toString(),
        0
    );

    interaction.reply({
        embeds: [roleMenuHeader],
        components: rows,
        flags: MessageFlags.Ephemeral,
    });
}
