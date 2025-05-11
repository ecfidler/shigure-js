import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
    MessageFlags,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { GUILDS } from "../utilities/constants";

export const guild = GUILDS.WHID;

export const commandData: CommandData = {
    type: ApplicationCommandType.ChatInput,
    description: "call and replay",
    options: [
        {
            name: "content",
            description: "the message you want echoed",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
};

export async function action({ interaction }: CommandArgs) {
    if (!interaction.isChatInputCommand()) {
        console.error("Unexpected interaction type");
        return;
    }

    await interaction.reply({
        content: "message echoed!",
        flags: MessageFlags.Ephemeral,
    });
    const { channel } = interaction;
    if (
        channel?.type !== ChannelType.GuildText &&
        channel?.type !== ChannelType.GuildVoice
    ) {
        return;
    }

    await channel.send({
        content: interaction.options.get("content")?.toString(),
    });
}
