import {
    EmbedBuilder,
    AttachmentBuilder,
    ApplicationCommandType,
    Colors,
    MessageFlags,
} from "discord.js";
import { CHANNELS, GUILDS } from "../utilities/constants";
// TODO: Replace SauceNAO with sagiri for type safety
import SauceNAO from "saucenao";
import auth from "../auth.json";
import type { CommandArgs } from "../types/CommandArgs";

//const fs = require(`fs`); // TESTING ONLY

// Setup Sauce finder
const sauceFinder = new SauceNAO(auth["SauceNAO-key"]);

const SAUCE_NAO_AUTHOR = {
    name: "SauceNAO",
    iconURL: "attachment://icon.png",
    url: "https://saucenao.com/",
};

// Attachments
const icon = new AttachmentBuilder("./assets/images/icon.png");

export const guild = GUILDS.GLOBAL;

export const commandData = {
    type: ApplicationCommandType.Message,
};

export async function action({ interaction }: CommandArgs) {
    if (!interaction.isMessageContextMenuCommand()) {
        console.error("Unexpected interaction type");
        return;
    }

    if (interaction.guild == null) {
        console.error("Interaction called with no guild");
        return;
    }

    if (interaction.channel == null) {
        console.error("Interaction called with no channel");
        return;
    }

    const isPublic = !(
        interaction.channel.id === CHANNELS.FINDER ||
        interaction.guild.id !== GUILDS.YONI
    );
    const msg = await interaction.channel?.messages.fetch({
        message: interaction.targetId,
    });
    const { attachments } = msg;
    const objective = attachments.last()?.url;

    if (objective == null) {
        // When there is no image on target message
        interaction.reply({
            embeds: [errorEmbed("EMPTY")],
            files: [icon],
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // TODO: Replace SauceNAO with sagiri for type safety
    const saucePayload = (await sauceFinder(objective)).json;
    const status = saucePayload.header.status;

    //fs.writeFileSync(`sauceData.json`, JSON.stringify(saucePayload, null, 2)); // TESTING ONLY

    if (status) {
        // Error Returned
        interaction.reply({
            embeds: [errorEmbed(status)],
            files: [icon],
            flags: isPublic ? [] : MessageFlags.Ephemeral,
        });
        return;
    }

    interaction.reply({
        embeds: [formatSauce(saucePayload, objective)],
        files: [icon],
        flags: isPublic ? [] : MessageFlags.Ephemeral,
    });
}

function formatSauce(payload: any, thumbnail: string) {
    const sauce = new EmbedBuilder()
        .setTitle("Source(s) found:")
        .setColor(Colors.Blurple)
        .setAuthor(SAUCE_NAO_AUTHOR)
        .setThumbnail(thumbnail)
        .setFooter({
            text: "Results pulled from SauceNAO, contact @fops for assistance",
            // TODO: This icon URL is broken. Find a new one.
            iconURL:
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/282/steaming-bowl_1f35c.png",
        });

    payload.results.forEach((result: any) => {
        if (parseInt(result.header.similarity) > 55) {
            // Only want results with similarity > 55

            let idx = result.header.index_id;
            if (idx == 5) {
                // Pixiv
                let title = "Pixiv";
                let content = `Poster: ${result.data.member_name}`;

                if (result.data?.ext_urls[0]) {
                    content += `\n [Link to Post](${result.data.ext_urls[0]})`;
                }

                sauce.addFields([
                    { name: "title", value: title },
                    { name: "content", value: content },
                ]);
            }

            if (idx == 41) {
                // Twitter
                let title = "Twitter";
                let content = "";

                if (result.data?.twitter_user_handle) {
                    content += `**Poster:** @${result.data.twitter_user_handle}`;
                }

                if (result.data?.ext_urls[0]) {
                    content += `\n [Link to Post](${result.data.ext_urls[0]})`;
                }

                sauce.addFields([
                    { name: "title", value: title },
                    { name: "content", value: content },
                ]);
            }

            if (idx == 9) {
                // Danbooru
                let title = "Boorus";
                let content = "";

                if (result.data?.creator) {
                    content += `Creator: ${result.data.creator}\n`;
                }
                if (result.data?.material) {
                    content += `Material: ${result.data.material}\n`;
                }
                if (result.data?.characters) {
                    content += `Character(s): ${result.data.characters}\n`;
                }
                if (result.data?.ext_urls) {
                    content += "**Link(s):**\n";
                    result.data.ext_urls.forEach((link: any) => {
                        content += formatLink(link);
                    });
                }

                sauce.addFields([
                    { name: "title", value: title },
                    { name: "content", value: content },
                ]);
            }
        }
    });

    if (sauce.data.fields?.length == 0) {
        sauce.addFields([
            { name: "error", value: "No accurate sources found..." },
            {
                name: "action",
                value: "Try checking on the [main website](https://saucenao.com/) in the case of an error",
            },
        ]);
    }

    return sauce;
}

function errorEmbed(code: number | "EMPTY") {
    const err = new EmbedBuilder()
        .setTitle("Error")
        .setColor(Colors.Red)
        .setAuthor(SAUCE_NAO_AUTHOR)
        .setFooter({
            text: "Contact @fops for assistance",
            // TODO: This icon URL is broken. Find a new one.
            iconURL:
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/exclamation-mark_2757.png",
        });

    if (code === "EMPTY") {
        err.setDescription("No image found in message");
    } else {
        const text = code > 0 ? "Server" : "Client";
        err.setDescription(`${text} error, Code: ${code}`);
    }

    return err;
}

function formatLink(link: string) {
    const baseUrl = link.split("https://")[1]?.split("/")[0];
    if (baseUrl == null) {
        throw new Error("Invalid URL");
    }
    return `[${baseUrl}](${link})\n`;
}
