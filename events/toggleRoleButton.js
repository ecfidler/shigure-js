const { getButtonRows, hasRole, roleMenuHeader } = require("../commands/roleup");
const roles = require("../assets/data/roles.json");


async function toggleRoleButtonEvent(client, interaction) {
    // the role id is interaction.customid.split("_")[1];
    // checks if the member has the role
    // gives or removes it
    // edits the original message by updating it

    const roleId = interaction.customId.split("_")[1];
    const has = hasRole(interaction.member, roleId);

    if (has) {
        await interaction.member.roles.remove(roleId);
    }
    else {
        await interaction.member.roles.add(roleId);
    }
    // interaction.rows
    //await interaction.update({
    //    embeds: [roleMenuHeader],
    //    components: getButtonRows(roles[interaction.guild.id].rows, interaction.member),
    //    ephemeral: true
    //});
}

module.exports = { toggleRoleButtonEvent };