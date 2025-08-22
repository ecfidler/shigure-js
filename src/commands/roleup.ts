import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Colors,
    EmbedBuilder,
    MessageFlags,
    TextDisplayBuilder,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { GUILDS } from "../utilities/constants";
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
    if (!interaction.isChatInputCommand()) {
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

    const roles = await getRoles(
        client,
        category.toString(),
        interaction.guild
    );
    const rows = getPaginatedRoleSelectionMessage(
        roles,
        interaction.member,
        category.toString(),
        0
    );

    const header = new TextDisplayBuilder().setContent(
        "## Choose your roles!\nClick on a gray role to add it; click on a green role to remove it."
    );

    await interaction.reply({
        components: [header, ...rows],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
}
