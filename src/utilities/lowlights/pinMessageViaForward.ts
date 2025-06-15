import {
    GuildMember,
    Message,
    type SendableChannels,
    EmbedBuilder,
} from "discord.js";

export async function pinMessageViaForward(
    author: GuildMember,
    message: Message,
    lowlightsChannel: SendableChannels
) {
    await sendAuthorshipEmbed(lowlightsChannel, author);
    await message.forward(lowlightsChannel);
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
