const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { CHANNELS, GUILDS, EMOJIS, ROLES } = require("../utilities/constants.js");

const guild = GUILDS.WHID;

const commandData = {
    defaultPermission: false,
    permissions : [
        {
            id: ROLES.MAJOR,
            type: "ROLE",
            permission: true,
        }
    ],
    type : "MESSAGE",
};

async function action(client, interaction) {
    const msg = await interaction.channel.messages.fetch(interaction.targetId);
    const mbr = await interaction.guild.members.fetch(msg.author.id);
    const content = transcribe(msg, mbr, interaction.member.displayName);

    const lowlight = await client.channels.cache.get(CHANNELS.LOW).send({ embeds: [content]});

    await msg.react(EMOJIS.PIN);
    await msg.reply(`${EMOJIS.PIN} Pinned!`);

    const jumpButton = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("View Pin")
                .setStyle("LINK")
                .setURL(lowlight.url)
        );

    await interaction.reply({ content: "Success!",/* components: [jumpButton],*/ ephemeral: true } );
}

function transcribe(message, member, pinner) {
    const pinEmbed = new MessageEmbed()
        .setColor(member.displayHexColor)
        .setTitle("Message Content")
        .setAuthor(member.displayName, member.user.displayAvatarURL({dynamic: true}), message.url)
        .setDescription(message.content)
        .setImage(message.attachments.last() ? message.attachments.last().url : null)
        .setTimestamp(message.createdAt)
        .setFooter(`${message.channel.name} | pinned by ${pinner}`, "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/pushpin_1f4cc.png");
    return pinEmbed;
}

module.exports = {commandData, action, guild};