const { GUILDS } = require("../utilities/constants.js");

const guild = GUILDS.WHID;

const commandData = {
    description: "call and replay",
    options: [
        {
            name: "content",
            description: "the message you want echoed",
            type: "STRING",
            required: true,
        },
    ],
    type: "CHAT_INPUT",
};

async function action(client, interaction) {
    await interaction.reply({ content: "message echoed!", ephemeral: true });
    await interaction.channel.send({
        content: interaction.options.get("content").value,
    });
}

module.exports = { commandData, action, guild };
