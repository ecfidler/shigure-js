import { ApplicationCommandType } from "discord.js";
import snoowrap from "snoowrap";
import { auth } from "../auth.js";
import type { CommandArgs } from "../types/CommandArgs.js";
import type { CommandData } from "../types/CommandData.js";
import { GUILDS } from "../utilities/constants.js";

// Reddit Client
let redditClient: snoowrap;
const getRedditClientSingleton = () => {
    if (redditClient == null) {
        redditClient = new snoowrap({
            // NOTE: We have already asserted that these vals exist
            userAgent: auth.RuserAgent!,
            clientId: auth.RclientId!,
            clientSecret: auth.RclientSecret!,
            username: auth.Rusername!,
            password: auth.Rpassword!,
        });
    }

    return redditClient;
};

const errorMessage =
    "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!\n_~error message_";

export const guild = GUILDS.WHID;

export const commandData: CommandData = {
    description: "gets a random piece of artwork from r/copypasta.",
    type: ApplicationCommandType.ChatInput,
};

export async function action({ interaction }: CommandArgs) {
    if (
        !interaction.isChatInputCommand() ||
        interaction.guildId == null ||
        interaction.guild == null
    ) {
        return;
    }

    const enablePastaCommand = checkAuthorizationHeadersForReddit(auth);
    if (!enablePastaCommand) {
        console.warn(
            "No reddit API credentials provided. Reddit features will not work"
        );
        return;
    }

    await interaction.deferReply();

    getRedditClientSingleton()
        .getRandomSubmission("copypasta")
        .then(
            async value => {
                if (value.selftext) {
                    if (value.selftext.length < 2000) {
                        await interaction.editReply(value.selftext);
                    } else {
                        const cutoff = 1991 - value.url.length;
                        await interaction.editReply(
                            `${value.selftext.substring(0, cutoff)}[...](<${
                                value.url
                            }>)`
                        );
                    }
                } else {
                    console.log(value);
                    await interaction.editReply(errorMessage);
                }
            },
            async value => {
                console.error(value);
                await interaction.editReply(errorMessage);
            }
        )
        .catch(err => {
            console.log(err);
        });
}

function checkAuthorizationHeadersForReddit(authObject: typeof auth) {
    return (
        authObject.RuserAgent != null &&
        authObject.RclientId != null &&
        authObject.RclientSecret != null &&
        authObject.Rusername != null &&
        authObject.Rpassword != null
    );
}
