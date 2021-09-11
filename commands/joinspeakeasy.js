const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { CHANNELS, GUILDS, EMOJIS, ROLES } = require("../utilities/constants.js");

const guild = GUILDS.YONI;

const commandData = {
    description : "sends the message containing the speakeasy toggle role.",
    permissions : [
        {
            id: ROLES.CHEF,
            type: "ROLE",
            permission: true,
        }
    ],
    type : "CHAT_INPUT",
};

async function action(client, interaction) {
    // Send message containing button that toggles the Connoisseur role and sends an ephemeral message telling the user that the role has been added/removed
    // References Bearcat bot code

    const toggleSpeakeasy = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Connisseur")
                .setStyle("PRIMARY")
                .setEmoji(EMOJIS.SPEAK)
                .setCustomId("toggleButton_Connisseur")
        );

    await interaction.channel.send({ content: "Click a button to recieve a corresponding role!", components: [toggleSpeakeasy], ephemeral: false } );
}

module.exports = {commandData, action, guild};