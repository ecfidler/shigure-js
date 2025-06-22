import {
    ApplicationCommandType,
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type TextBasedChannel,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { CHANNELS, EMOJIS, GUILDS } from "../utilities/constants";
import { pinMessageViaForward } from "../utilities/lowlights/pinMessageViaForward";
import { pinMessageViaEmbed } from "../utilities/lowlights/pinMessageViaEmbed";

const lowlightChannelByGuild = {
    [GUILDS.WHID]: CHANNELS.LOW,
    [GUILDS.BEN_TESTING]: CHANNELS.LOW_TEST,
} as const;

export const guilds = Object.keys(lowlightChannelByGuild);

export const commandData: CommandData = {
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    // TODO: I'm not exactly sure how this was working before because I can't find any docs
    // for "permissions" field. For now, I've set "defaultMemberPermissions" to administrator
    // as a safe alternative.

    // permissions: [
    //     // whid
    //     {
    //         id: ROLES.MAJOR,
    //         type: ApplicationCommandOptionType.Role,
    //         permission: true,
    //     },
    //     // Ben testing server
    //     {
    //         id: "1335083523249406012",
    //         type: ApplicationCommandOptionType.Role,
    //         permission: true,
    //     },
    // ],
};

export async function action({ client, interaction }: CommandArgs) {
    if (!interaction.isMessageContextMenuCommand()) {
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

    // TODO: Use message components maybe?
    if (isTextChannelAgeRestricted(message.channel)) {
        await pinMessageViaEmbed(
            author,
            message,
            interaction.user,
            lowlightsChannel
        );
    } else {
        await pinMessageViaForward(author, message, lowlightsChannel);
    }

    await message.react(EMOJIS.PIN);
    await message.reply(`${EMOJIS.PIN} Pinned!`);

    await interaction.reply({
        content: "Success!",
        flags: MessageFlags.Ephemeral,
    });
}

function isTextChannelAgeRestricted(channel: TextBasedChannel): boolean {
    switch (channel.type) {
        case ChannelType.DM:
        case ChannelType.GroupDM:
        case ChannelType.PublicThread:
        case ChannelType.AnnouncementThread:
        case ChannelType.PrivateThread:
            return false;
        default:
            return channel.nsfw;
    }
}
