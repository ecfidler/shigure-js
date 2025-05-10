import type { CommandArgs } from "../types/CommandArgs";
import { isMemberCached } from "../utilities/isMemberCached";
import { getButtonRows, getRoles } from "../utilities/roleup";

const { MessageFlags } = require("discord.js");

async function changeRolesPageEvent({ client, interaction }: CommandArgs) {
    if (!interaction.isButton() || !isMemberCached(interaction.member)) {
        return;
    }

    const [category, pageNumber] = interaction.customId.split("_").slice(1);
    if (category == null || pageNumber == null) {
        console.error("Invalid role change event");
        return;
    }

    const components = getButtonRows(
        await getRoles(client, category, interaction.guild),
        interaction.member,
        category,
        parseInt(pageNumber)
    );

    await interaction.update({
        embeds: interaction.embeds,
        components: components,
        flags: MessageFlags.Ephemeral,
    });
}

module.exports = { changeRolesPageEvent };
