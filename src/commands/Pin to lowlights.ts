import {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    MessageFlags,
    ChatInputCommandInteraction,
    Client,
    GuildMember,
    MessageContextMenuCommandInteraction,
    Message,
    TextChannel,
    type GuildBasedChannel,
    type TextBasedChannel,
    type SendableChannels,
} from "discord.js";
import { CHANNELS, GUILDS, EMOJIS, ROLES } from "../utilities/constants";
import type { CommandArgs } from "../types/CommandArgs";
import { guild } from "./Find Source";

const lowlightChannelByGuild = {
    [GUILDS.WHID]: CHANNELS.LOW,
    [GUILDS.BEN_TESTING]: CHANNELS.LOW_TEST,
};

export const guilds = Object.keys(lowlightChannelByGuild);

export const commandData = {
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

export async function action({ client, interaction }: CommandArgs) {
    if (
        !interaction.isMessageContextMenuCommand() ||
        interaction.guildId == null ||
        interaction.guild == null
    ) {
        return;
    }

    const lowlightsChannelId = lowlightChannelByGuild[interaction.guildId];
    if (lowlightsChannelId == null) {
        console.error(
            `Lowlights channel not configured for guild ${interaction.guild.name}`
        );
        return;
    }
    const lowlightsChannel = client.channels.cache.get(lowlightsChannelId);
    if (lowlightsChannel == null) {
        console.error(
            `Lowlights channel with id ${lowlightsChannelId} not found in guild ${interaction.guild.name}`
        );
        return;
    }
    if (!lowlightsChannel.isSendable()) {
        console.error(
            `Lowlights channel with id ${lowlightsChannelId} in guild ${interaction.guild.name} is not a text channel`
        );
        return;
    }

    const message = interaction.targetMessage;
    const author = await interaction.guild.members.fetch(message.author.id);

    // TODO: Use message components
    await pinMessage(author, message, lowlightsChannel);

    await message.react(EMOJIS.PIN);
    await message.reply(`${EMOJIS.PIN} Pinned!`);

    await interaction.reply({
        content: "Success!",
        flags: MessageFlags.Ephemeral,
    });
}

async function pinMessage(
    author: GuildMember,
    message: Message,
    lowlightsChannel: SendableChannels
) {
    await sendAuthorshipEmbed(lowlightsChannel, author);
    message.forward(lowlightsChannel);
}

async function sendAuthorshipEmbed(
    lowlightsChannel: SendableChannels,
    member: GuildMember
) {
    await lowlightsChannel.send({
        embeds: [
            new EmbedBuilder().setColor(member.displayHexColor).setFooter({
                text: `${member.displayName}`,
                iconURL: member.user.displayAvatarURL(),
            }),
        ],
    });
}
