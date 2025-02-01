const {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
} = require("discord.js");
const {
    CHANNELS,
    GUILDS,
    EMOJIS,
    ROLES,
} = require("../utilities/constants.js");

const lowlightChannelByGuild = {
    [GUILDS.WHID]: CHANNELS.LOW,
    [GUILDS.BEN_TESTING]: CHANNELS.LOW_TEST,
};
const guilds = Object.keys(lowlightChannelByGuild);

const commandData = {
    defaultPermission: false,
    permissions: [
        // whid
        {
            id: ROLES.MAJOR,
            type: ApplicationCommandOptionType.Role,
            permission: true,
        },
        // Ben testing server
        {
            id: "1335083523249406012",
            type: ApplicationCommandOptionType.Role,
            permission: true,
        },
    ],
    type: ApplicationCommandType.Message,
};

async function action(client, interaction) {
    const msg = await interaction.channel.messages.fetch({
        message: interaction.targetId,
    });
    const mbr = await interaction.guild.members.fetch(msg.author.id);

    await pinMessage(msg, mbr, interaction, client);

    await msg.react(EMOJIS.PIN);
    await msg.reply(`${EMOJIS.PIN} Pinned!`);

    await interaction.reply({
        content: "Success!",
        ephemeral: true,
    });
}

async function pinMessage(msg, mbr, interaction, client) {
    const embed = createPinEmbed(msg, mbr, interaction.member.displayName);
    await client.channels.cache
        .get(lowlightChannelByGuild[interaction.guildId])
        .send({ embeds: [embed] });
}

function createPinEmbed(message, member, pinner) {
    const pinEmbed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle("Message Content")
        .setAuthor({
            name: member.displayName,
            iconURL: member.user.displayAvatarURL({}),
            url: message.url,
        })
        .setDescription(message.content)
        .setImage(
            message.attachments.last() ? message.attachments.last().url : null
        )
        .setTimestamp(message.createdAt)
        .setFooter({
            text: `${message.channel.name} | pinned by ${pinner}`,
            iconURL:
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/pushpin_1f4cc.png",
        });
    return pinEmbed;
}

module.exports = {
    commandData,
    action,
    guilds,
};
