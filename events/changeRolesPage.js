const { getButtonRows, getRoles } = require("../utilities/roleup.js");

async function changeRolesPageEvent(client, interaction) {
    const [category, pageNumber] = interaction.customId.split("_").slice(1);

    const components = getButtonRows(
        await getRoles(client, category, interaction.guild),
        interaction.member,
        category,
        parseInt(pageNumber)
    );

    await interaction.update({
        embeds: interaction.embeds,
        components: components,
        ephemeral: true,
    });
}

module.exports = { changeRolesPageEvent };
