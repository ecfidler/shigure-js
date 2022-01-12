const {GUILDS, OWNER, ROLES} = require("../utilities/constants.js");

const guild = GUILDS.WHID;

const commandData = {
    description : "call and replay",
    defaultPermission: false,
    permissions : [
        {
            id: ROLES.MAJOR,
            type: "ROLE",
            permission: true,
        }
    ],
    options : [
        {
            name: "content",
            description: "the message you want echoed",
            type: "STRING",
            required: true,
        }
    ],
    type : "CHAT_INPUT",
};

async function action(client, interaction) {
    if (interaction.user.id != OWNER) {
        await interaction.reply({content: "this command is set to owner only, sorry ben", ephemeral: true});
    }
    else {
        await interaction.reply({content: "message echoed!", ephemeral: true});
        await interaction.channel.send({ content: interaction.options.get("content").value});
    }
    
}

module.exports = {commandData, action, guild};