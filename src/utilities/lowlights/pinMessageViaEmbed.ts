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
    const imageAttachment =
        message.attachments.find((a) =>
            a.contentType?.startsWith("image/")
        ) ?? null;

    const videoAttachments = message.attachments.filter((a) =>
        a.contentType?.startsWith("video/")
    );

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
                .setDescription(message.content || null)
                .setImage(imageAttachment?.url ?? null)
                .setTimestamp(message.createdAt)
                .setFooter({
                    text: `📌 #${
                        (message.channel as Message<true>["channel"]).name
                    } | pinned by ${pinner.displayName}`,
                }),
        ],
    });

    for (const video of videoAttachments.values()) {
        await lowlightsChannel.send(video.url);
    }
}
