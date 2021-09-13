const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { CHANNELS, GUILDS, EMOJIS, ROLES } = require("../utilities/constants.js");
const roles = require("../assets/data/roles.json");

const guild = GUILDS.GLOBAL;

const commandData = {
    description : "Opens a menu to allow you to add or remove roles from yourself",
    type : "CHAT_INPUT",
};

async function action(client, interaction) {
    let roleData = [];
    let rows = [];

    // select the correct role array array
    if (!roles?.[interaction.guild.id]) {
        interaction.reply({ content: "\'roleup\' is not availible in this server, sorry.", ephemeral: true});
        return;
    }
    else {
        roleData = roles[interaction.guild.id].rows;
    }

    rows = getButtonRows(roleData, interaction.member);

    interaction.reply({ embeds: [roleMenuHeader], components: rows, ephemeral: true});

}

function getButtonRows(serverRoleData, member) {
    let buffer = []
    serverRoleData.forEach(row => {
        let actionRow = new MessageActionRow();
        row.forEach(role => {
            actionRow.addComponents(
                new MessageButton()
                    .setLabel(role.name)
                    .setStyle(hasRole(member, role.id) ? "SUCCESS" : "SECONDARY")
                    .setEmoji(role.emoji)
                    .setCustomId(`toggleRoleButton_${role.id}`) // if the role id is 12345, the custom id will be "toggleRoleButton_12345"
            );
            
        });
        buffer.push(actionRow);
    });

    return buffer;
}

function hasRole(member, id) {
    return member.roles.cache.has(id);
}

const roleMenuHeader = new MessageEmbed()
    .setDescription("Click on a grey role to add it, click on a green role to remove it!")
    .setColor("BLURPLE")
    .setAuthor("/roleup") // TODO: add author icon?
    .setTimestamp();

module.exports = {commandData, action, guild, getButtonRows, hasRole, roleMenuHeader};

/* TODO
- Add logic to toggle the role
- add hasRole
- make the button change color when it gets added/removed
- add embed instead of message content?
*/