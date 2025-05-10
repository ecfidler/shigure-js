import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    MessageFlags,
} from "discord.js";

const guild = "173840048343482368";

const commandData = {
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

async function action(client, interaction) {
    await interaction.reply({
        content: interaction.options.get("test-type").value + "!",
        flags: MessageFlags.Ephemeral,
    });
}

module.exports = { commandData, action, guild };
