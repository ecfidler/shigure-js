const { hasRole, roleMenuHeader } = require("../commands/roleup");

async function toggleRoleButtonEvent(client, interaction) {
    // the role id is interaction.customid.split("_")[1];
    // checks if the member has the role
    // gives or removes it
    // edits the original message by updating it

    const roleId = interaction.customId.split("_")[1];
    const has = hasRole(interaction.member, roleId);

    if (has) {
        await interaction.member.roles.remove(roleId);
    } else {
        await interaction.member.roles.add(roleId);
    }
    for (let row of interaction.message.components) {
        let button = row.components.find(
            (button) => button.customId === interaction.customId
        );
        if (button) {
            button.setStyle(has ? "SECONDARY" : "SUCCESS");
        }
    }
    await interaction.update({
        embeds: [roleMenuHeader],
        components: interaction.message.components,
        ephemeral: true,
    });
}

module.exports = { toggleRoleButtonEvent };
