import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    MessageFlags,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";

export const guild = "173840048343482368";

export const commandData: CommandData = {
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
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const category = interaction.options.get("test-type")?.value;
    if (category == null) {
        await interaction.reply({
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
