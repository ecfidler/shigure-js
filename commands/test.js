const guild = "173840048343482368";

const commandData = {
    description : "call and response",
    options : [
        {
            name: "test-type",
            description: "how do you want to test",
            choices: [
                {
                    name: "flip",
                    value: "flop"
                },
                {
                    name: "drip",
                    value: "drop"
                },
                {
                    name: "ping",
                    value: "pong"
                },
            ],
            type: "STRING",
            required: true,
        }
    ],
    type : "CHAT_INPUT",
};

async function action(client, interaction) {
    await interaction.reply({content: interaction.options.get("test-type").value+"!", ephemeral: true});
}

module.exports = {commandData, action, guild};