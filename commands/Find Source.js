const { MessageEmbed, MessageAttachment, CommandInteractionOptionResolver } = require("discord.js");
const { CHANNELS, GUILDS, EMOJIS, ROLES } = require("../utilities/constants.js");
const SauceNAO = require('saucenao');
const auth = require('../auth.json');


// Setup Sauce finder
const sauceFinder = new SauceNAO(auth["SauceNAO-key"]);

// Attachments
const icon = new MessageAttachment("./assets/images/icon.png");
const doodle = new MessageAttachment("./assets/images/doodle.png");


const guild = GUILDS.WHID;

const commandData = {
    type : "MESSAGE",
};

async function action(client, interaction) {
    let public = !((interaction.channel.id == CHANNELS.FINDER) || (interaction.guild.id != GUILDS.YONI));
    let msg = await interaction.channel.messages.fetch(interaction.targetId)
    let attch = msg.attachments;

    if (attch == null) { // When there is no image on target message
        interaction.reply({ embeds: [errorEmbed("EMPTY")], files: [icon], ephemeral: true });
        return;
    }

    let objective = attch.last().url;
    let saucePayload = (await sauceFinder(objective)).json;
    let status = saucePayload.header.status;


    if (status) { // Error Returned
        interaction.reply({ embeds: [errorEmbed(status)], files: [icon], ephemeral: public });
        return;
    }

    interaction.reply({ embeds: [formatSauce(saucePayload, objective)], files: [icon], ephemeral: public });

}

function formatSauce(payload, thumbnail) {

    sauce = new MessageEmbed()
        .setTitle("Source(s) found:")
        .setColor("BLURPLE")
        .setAuthor("SauceNAO", "attachment://icon.png" , "https://saucenao.com/")
        .setThumbnail(thumbnail)
        .setFooter("Results pulled from SauceNAO, contact @fops#1969 for assistance", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/282/steaming-bowl_1f35c.png");

    payload.results.forEach(result => {
        if (parseInt(result.header.similarity) > 70) { // Only want results with similarity > 70

            let idx = result.header.index_id;
            if (idx == 5) { // Pixiv
                let title = "Pixiv";
                let content = `Poster: ${result.data.member_name}`
    
                if (result.data.ext_urls[0]) {
                    content += `\n [Link to Post](${result.data.ext_urls[0]})`
                }
                
                sauce.addField(title, content);
    
            }

            if (idx == 41)  { // Twitter
                // ...
            }

            if (idx == 9) { // Danbooru
                let title = "Boorus";
                let content = "";

                if (result.data?.creator) {
                    content += `Creator: ${result.data.creator}\n`;
                }
                if (result.data?.material) {
                    content += `Material: ${result.data.material}\n`;
                }
                if (result.data?.characters) {
                    content += `Character(s): ${result.data.characters}\n`;
                }
                if (result.data?.ext_urls) {
                    content += "**Link(s):**\n";
                    result.data.ext_urls.forEach( link => {
                        content += formatLink(link);
                    });
                }
                
                sauce.addField(title, content);
            }
        }
    });

    if (sauce.fields.length == 0) {
        sauce.addField("No accurate sources found...", "Try checking on the [main website](https://saucenao.com/) in the case of an error")
    }

    return sauce;
}

function errorEmbed(code) {
    let text = (code > 0) ? "Server" : "Client";

    err = new MessageEmbed()
        .setTitle("Error")
        .setColor("RED")
        .setAuthor("SauceNAO", "attachment://icon.png" , "https://saucenao.com/")
        .setDescription(`${text} error, Code: ${code}`)
        .setFooter("contact @fops#1969 for assistance", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/exclamation-mark_2757.png");

    if (code == "EMPTY") {
        err.setDescription("No image found in message");
    }

    return err;
}

function formatLink(link) {
    let name = link.split("https://")[1].split("/")[0];
    return `[${name}](${link})\n`
}

module.exports = {commandData, action, guild};