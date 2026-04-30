import { ApplicationCommandType } from "discord.js";
import { auth } from "../auth.js";
import type { CommandArgs } from "../types/CommandArgs.js";
import type { CommandData } from "../types/CommandData.js";
import { GUILDS } from "../utilities/constants.js";
import {
    getRandomSubmission,
    type RedditCreds,
} from "../utilities/reddit-client.js";

const errorMessage =
    "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!\n_~error message_";

export const guilds = [GUILDS.WHID, GUILDS.TEST];

export const commandData: CommandData = {
    description: "gets a random work of art from r/copypasta.",
    type: ApplicationCommandType.ChatInput,
};

export async function action({ interaction }: CommandArgs) {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const creds = getRedditCreds();
    if (creds == null) {
        console.warn(
            "No reddit API credentials provided. Reddit features will not work"
        );
        return;
    }

    await interaction.deferReply();

    try {
        const post = await getRandomSubmission("copypasta", creds);
        if (post.selftext) {
            if (post.selftext.length < 2000) {
                await interaction.editReply(post.selftext);
            } else {
                const cutoff = 1991 - post.url.length;
                await interaction.editReply(
                    `${post.selftext.substring(0, cutoff)}[...](<${post.url}>)`
                );
            }
        } else {
            console.log(post);
            await interaction.editReply(errorMessage);
        }
    } catch (err) {
        console.error(err);
        await interaction.editReply(errorMessage);
    }
}

function getRedditCreds(): RedditCreds | null {
    const { RuserAgent, RclientId, RclientSecret, Rusername, Rpassword } = auth;
    if (
        RuserAgent == null ||
        RclientId == null ||
        RclientSecret == null ||
        Rusername == null ||
        Rpassword == null
    ) {
        return null;
    }
    return {
        userAgent: RuserAgent,
        clientId: RclientId,
        clientSecret: RclientSecret,
        username: Rusername,
        password: Rpassword,
    };
}
