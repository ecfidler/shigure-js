const snoowrap = require('snoowrap');
const {GUILDS} = require("../utilities/constants.js");
const auth = require('../auth.json');

// Reddit Client
const redditClient = new snoowrap({
    userAgent: auth.RuserAgent,
    clientId: auth.RclientId,
    clientSecret: auth.RclientSecret,
    username: auth.Rusername,
    password: auth.Rpassword
  });

const errorMessage = "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!\n_~error message_"

const guild = GUILDS.WHID;

const commandData = {
    description : "gets a random piece of artwork from r/copypasta.",
    type : "CHAT_INPUT",
};

async function action(client, interaction) {
    await interaction.deferReply();

    redditClient.getRandomSubmission("copypasta").then(async (value) => {
        if (value.selftext) {
            if (value.selftext.length < 2000) {
                await interaction.editReply(value.selftext);
            } else {
                const cutoff = 1991 - value.url.length;
                await interaction.editReply(`${value.selftext.substring(0,cutoff)}[...](<${value.url}>)`);
            }
        }
        else {
            console.log(value);
            await interaction.editReply(errorMessage);
        }
        
    }, async (value) => {
        console.error(value);
        await interaction.editReply(errorMessage);
    }).catch(err => {
        console.log(err);
    });
};

module.exports = {commandData, action, guild};