import {
    EmbedBuilder,
    GuildMember,
    Message,
    User,
    type SendableChannels,
} from "discord.js";

export async function pinMessageViaEmbed(
    author: GuildMember,
    message: Message,
    pinner: User,
    lowlightsChannel: SendableChannels
) {
    await lowlightsChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(author.displayHexColor)
                .setTitle("Message Content")
                .setAuthor({
                    name: author.displayName,
                    iconURL: author.user.displayAvatarURL(),
                    url: message.url,
                })
                .setDescription(message.content)
                .setImage(message.attachments.last()?.url ?? null)
                .setTimestamp(message.createdAt)
                .setFooter({
                    text: `📌 #${
                        (message.channel as Message<true>["channel"]).name
                    } | pinned by ${pinner.displayName}`,
                }),
        ],
    });
}
