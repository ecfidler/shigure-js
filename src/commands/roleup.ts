import {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    Colors,
} from "discord.js";
import { GUILDS } from "../utilities/constants";
import { getButtonRows, getRoles } from "../utilities/roleup";

const guild = GUILDS.GLOBAL;

const commandData = {
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

async function action(client, interaction) {
    if (interaction.guild.id !== GUILDS.WHID) {
        interaction.reply({
            content: "'roleup' is not availible in this server, sorry.",
            ephemeral: true,
        });
        return;
    }

    const category = interaction.options.get("category").value;
    const roleData = await getRoles(client, category, interaction.guild);
    const rows = getButtonRows(roleData, interaction.member, category, 0);

    interaction.reply({
        embeds: [roleMenuHeader],
        components: rows,
        ephemeral: true,
    });
}

module.exports = {
    commandData,
    action,
    guild,
    roleMenuHeader,
};
