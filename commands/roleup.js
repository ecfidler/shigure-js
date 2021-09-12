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
    if (interaction.guild.id == GUILDS.YONI) {
        roleData = roles.sauce.rows;
    }
    else if (interaction.guild.id == GUILDS.WHID) {
        roleData = roles.whid.rows;
    }
    else {
        interaction.reply({ content: "\'roleup\' is not availible in this server, sorry.", ephemeral: true});
        return;
    }

    roleData.forEach(row => {
        let actionRow = new MessageActionRow();
        row.forEach(role => {
            actionRow.addComponents(
                new MessageButton()
                    .setLabel(role.name)
                    .setStyle("PRIMARY") // CHANGE TO BE THE LOGIC TO CHECK IF THE USER HAS THE ROLE OR NOT: hasRole(role.id) ? "PRIMARY" : "DANGER"; where hasRole is a function to return true if the member has the role.
                    .setEmoji(role.emoji)
                    .setCustomId(`toggleRoleButton_${role.name}`) // if the role name is Role, the custom id will be "toggleRoleButton_Role"
            );
            
        });
        rows.push(actionRow);
    });

    interaction.reply({ content: "Click on a role below to add or remove it from your user", components: rows, ephemeral: true});

}

module.exports = {commandData, action, guild};

/*
const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Connisseur")
                .setStyle("PRIMARY")
                .setEmoji(EMOJIS.SPEAK)
                .setCustomId("toggleRoleButton_Connisseur")
        );

    await interaction.channel.send({ content: "Click a button to recieve a corresponding role!", components: [toggleSpeakeasy], ephemeral: true } ); // MAKE IT FALSE EVENTUALLY
*/