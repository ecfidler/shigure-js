import type { CommandArgs } from "../types/CommandArgs";
import { GUILDS } from "../utilities/constants";
import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    MessageFlags,
    ChannelType,
} from "discord.js";

export const guild = GUILDS.WHID;

export const commandData: CommandData = {
    description: "call and replay",
    options: [
        {
            name: "content",
            description: "the message you want echoed",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
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
