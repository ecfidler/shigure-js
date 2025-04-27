const {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    MessageFlags,
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
    if (
        !interaction.isMessageContextMenuCommand() ||
        interaction.guildId == null
    ) {
        return;
    }

    const message = interaction.targetMessage;
    const member = await interaction.guild.members.fetch(message.author.id);

    await pinMessage(interaction, client, member);
    message.forward(lowlightChannelByGuild[interaction.guildId]);

    await message.react(EMOJIS.PIN);
    await message.reply(`${EMOJIS.PIN} Pinned!`);

    await interaction.reply({
        content: "Success!",
        flags: MessageFlags.Ephemeral,
    });
}

async function pinMessage(interaction, client, member) {
    await client.channels.cache
        .get(lowlightChannelByGuild[interaction.guildId])
        .send({
            embeds: [
                new EmbedBuilder().setColor(member.displayHexColor).setFooter({
                    text: `${member.displayName}`,
                    iconURL: member.user.displayAvatarURL(),
                }),
            ],
        });
}

module.exports = {
    commandData,
    action,
    guilds,
};
