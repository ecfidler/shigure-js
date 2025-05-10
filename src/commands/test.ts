import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    MessageFlags,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";

export const guild = "173840048343482368";

export const commandData = {
    description: "call and response",
    options: [
        {
            name: "test-type",
            description: "how do you want to test",
            choices: [
                {
                    name: "flip",
                    value: "flop",
                },
                {
                    name: "drip",
                    value: "drop",
                },
                {
                    name: "ping",
                    value: "pong",
                },
            ],
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    type: ApplicationCommandType.ChatInput,
};

export async function action({ interaction }: CommandArgs) {
    if (
        !interaction.isChatInputCommand() ||
        interaction.guildId == null ||
        interaction.guild == null ||
        interaction.options == null
    ) {
        return;
    }

    const category = interaction.options.get("test-type")?.value;
    if (category == null) {
        interaction.reply({
            content: "Please choose a category",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    await interaction.reply({
        content: category + "!",
        flags: MessageFlags.Ephemeral,
    });
}
