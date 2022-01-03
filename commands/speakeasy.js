const { MessageEmbed } = require("discord.js");
const { hasRole } = require("../commands/roleup");

const { GUILDS, ROLES} = require("../utilities/constants.js");

const guild = GUILDS.YONI;

const commandData = {
    description : "toggle the NSFW role on yourself",
    type : "CHAT_INPUT",
};

async function action(client, interaction) {

    const has = hasRole(interaction.member, ROLES.NSFW);

    if (has) {
        await interaction.member.roles.remove(ROLES.NSFW);
        await interaction.reply({embeds: [makeEmbed("Removed the Connoisseur role.\nYou can no longer view the Speakeasy category.")], ephemeral: true});
    }
    else {
        await interaction.member.roles.add(ROLES.NSFW);
        await interaction.reply({embeds: [makeEmbed("Added the Connoisseur role.\nYou can now view the Speakeasy category.")], ephemeral: true});
    }

}

function makeEmbed(text) {
    let embed = new MessageEmbed()
    .setDescription(text)
    .setColor("BLURPLE")
    .setAuthor("/speakeasy")
    .setTimestamp();

    return embed;
}

module.exports = {commandData, action, guild };