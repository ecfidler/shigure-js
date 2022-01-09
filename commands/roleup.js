const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { CHANNELS, GUILDS, EMOJIS, ROLES, MAXIMUMBUTTONROWS, BUTTONROWMAXLENGTH } = require("../utilities/constants.js");
const roles = require("../assets/data/roles.json");

const guild = GUILDS.GLOBAL;

const commandData = {
    description : "Opens a menu to allow you to add or remove roles from yourself",
    options : [
        {
            name : "category",
            description : "The category of roles that you wish to choose from",
            choices : [
                {
                    name : "Interests",
                    value : "interests"
                },
                {
                    name : "Languages",
                    value : "languages"
                },
                {
                    name : "Schools",
                    value : "schools"
                }
            ],
            type : "STRING",
            required : true,
        }
    ],
    type : "CHAT_INPUT",
};

const roleMenuHeader = new MessageEmbed()
    .setDescription("Click on a grey role to add it, click on a green role to remove it!")
    .setColor("BLURPLE")
    .setAuthor("/roleup") // TODO: add author icon?
    .setTimestamp();

class EmojiNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "EmojiNotFoundError";
    }
}

async function action(client, interaction) {
    if (interaction.guild.id !== GUILDS.WHID) {
        interaction.reply({ content: "\'roleup\' is not availible in this server, sorry.", ephemeral: true});
        return;
    }

    let option = null

    let roleData = findRoles(interaction.options.get("category").value, interaction.guild);
    
    let guildEmojis = client.guilds.cache.get(GUILDS.ROLE).emojis;
    await getOrMakeRoleEmojis(guildEmojis, roleData);
    
    let rows = getButtonRows(roleData, interaction.member);

    interaction.reply({ embeds: [roleMenuHeader], components: rows, ephemeral: true});
}

function findRoles(option, guild) {
    guildRoles = guild.roles.cache;
    let start = guildRoles.find(role => role.name === ("#Category_"+option));
    let end = guildRoles.find(role => role.name === ("#EndCategory_"+option));
    let roles = [];

    guildRoles.each(role => {
        if (role.comparePositionTo(start) < 0 && role.comparePositionTo(end) > 0) {
            roles.push(role);
            console.log(role.name);
        }
    });

    return roles;
}

async function getOrMakeRoleEmojis(guildEmojis, roles) {
    for (let role of roles) {
        role.emoji = await resolveRoleEmoji(guildEmojis, role);
    };
}

async function resolveRoleEmoji(guildEmojis, role) {
    if (role.unicodeEmoji) // e.g. "💩"
        return role.unicodeEmoji;
    if (!role.icon)
        return null;

    try {
        return await getCustomRoleEmoji(guildEmojis, role);
    } catch (error) {
        if (error instanceof EmojiNotFoundError) {
            await makeCustomRoleEmoji(guildEmojis, role);
            return await getCustomRoleEmoji(guildEmojis, role);
        } else {
            throw error;
        }
    }
}

async function getCustomRoleEmoji(emojis, role) {
    let emoji = await emojis.cache.find(emoji => emoji.name === emojify(role.name));
    if (!emoji) {
        throw new EmojiNotFoundError(`Could not find emoji for role ${role.name}`);
    } else {
        return emoji;
    }
}

async function makeCustomRoleEmoji(emojis, role) {
    let url = makeEmojiURL(role);
    let result = await emojis.create(url, emojify(role.name));
}

function makeEmojiURL(role) {
    return `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`;
}

function emojify(text) {
    return text.replace(' ', '_');
}

function getButtonRows(serverRoles, member) {
    let buffer = [];
    let counter = 0;
    let row = null;

    for (let role of serverRoles) {
        if (!row) {
            row = new MessageActionRow();
        }
        console.log(role.name, role.emoji);
        row.addComponents(
            new MessageButton()
                .setLabel(role.name)
                .setStyle(hasRole(member, role.id) ? "SUCCESS" : "SECONDARY")
                .setEmoji(role.emoji)
                .setCustomId(`toggleRoleButton_${role.id}`) // if the role id is 12345, the custom id will be "toggleRoleButton_12345"
        );
        counter++;
        if (counter % BUTTONROWMAXLENGTH == 0) {
            buffer.push(row);
            row = null;
        }
        if (counter >= BUTTONROWMAXLENGTH * MAXIMUMBUTTONROWS) {
            break;
        }
    }

    if (row) {
        buffer.push(row);
    }

    return buffer;
}

function hasRole(member, id) {
    return member.roles.cache.has(id);
}

module.exports = {commandData, action, guild, getButtonRows, hasRole, roleMenuHeader};