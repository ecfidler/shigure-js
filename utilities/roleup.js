const { MessageActionRow, MessageButton } = require("discord.js");
const {
    BUTTON_ROW_MAX_LENGTH,
    GUILDS,
    MAXIMUM_BUTTON_ROWS,
    DISALLOWED_EMOJI_CHARACTERS_REGEX,
} = require("./constants");

const MAXROLEROWS = MAXIMUM_BUTTON_ROWS - 1;

function getButtonRows(serverRoles, member, category, page) {
    let rows = [];

    serverRoles.sort((a, b) => a.name.localeCompare(b.name));

    if (serverRoles.length <= MAXIMUM_BUTTON_ROWS * BUTTON_ROW_MAX_LENGTH) {
        rows = getButtonRowsWithoutPages(serverRoles, member);
    } else {
        rows = getButtonRowsWithPages(serverRoles, member, category, page);
    }

    return rows;
}

function getButtonRowsWithoutPages(serverRoles, member) {
    const rows = [];
    rows.push(...makeRoleRows(MAXIMUM_BUTTON_ROWS, serverRoles, member));
    return rows;
}

function getButtonRowsWithPages(serverRoles, member, category, page) {
    const rows = [];
    moveToPage(page, serverRoles);
    rows.push(...makeRoleRows(MAXROLEROWS, serverRoles, member));
    rows.push(
        new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("<")
                .setStyle("PRIMARY")
                .setCustomId(`changeRolesPage_${category}_${page - 1}`)
                .setDisabled(page === 0),
            new MessageButton()
                .setLabel(">")
                .setStyle("PRIMARY")
                .setCustomId(`changeRolesPage_${category}_${page + 1}`)
                .setDisabled(serverRoles.length === 0)
        )
    );
    return rows;
}

function moveToPage(page, serverRoles) {
    if (page > 0) {
        serverRoles.splice(0, page * BUTTON_ROW_MAX_LENGTH * MAXROLEROWS);
    }
}

function makeRoleRows(numRows, serverRoles, member) {
    const rows = [];
    let i = 0;
    while (i < numRows && serverRoles.length > 0) {
        const row = makeRowOfRoles(serverRoles, member);
        rows.push(row);
        i++;
    }
    return rows;
}

function makeRowOfRoles(serverRoles, member) {
    const row = new MessageActionRow();
    let j = 0;
    while (j < BUTTON_ROW_MAX_LENGTH && serverRoles.length > 0) {
        const role = serverRoles.shift();
        row.addComponents(
            new MessageButton()
                .setLabel(role.name)
                .setStyle(hasRole(member, role.id) ? "SUCCESS" : "SECONDARY")
                .setEmoji(role.emoji)
                .setCustomId(`toggleRoleButton_${role.id}`)
        );
        j++;
    }
    return row;
}

function hasRole(member, id) {
    return member.roles.cache.has(id);
}

async function getRoles(client, category, guild) {
    const guildRoles = guild.roles.cache;
    const start = guildRoles.find(
        role => role.name === "#Category_" + category
    );
    const end = guildRoles.find(
        role => role.name === "#EndCategory_" + category
    );
    const existingEmojis = client.guilds.cache.get(GUILDS.ROLE).emojis;
    const roles = [];

    guildRoles.each(role => {
        if (
            role.comparePositionTo(start) < 0 &&
            role.comparePositionTo(end) > 0
        ) {
            roles.push(role);
            console.log(role.name);
        }
    });

    await getOrMakeRoleEmojis(existingEmojis, roles);

    return roles;
}

async function getOrMakeRoleEmojis(guildEmojis, roles) {
    for (const role of roles) {
        role.emoji = await resolveRoleEmoji(guildEmojis, role);
    }
}

async function resolveRoleEmoji(guildEmojis, role) {
    if (role.unicodeEmoji != null) {
        // e.g. "💩"
        return role.unicodeEmoji;
    }

    if (role.icon == null) {
        return null;
    }

    const customRoleEmoji = await getCustomRoleEmoji(guildEmojis, role);

    if (customRoleEmoji != null) {
        return customRoleEmoji;
    }

    await makeCustomRoleEmoji(guildEmojis, role);
    const newCustomRoleEmoji = await getCustomRoleEmoji(guildEmojis, role);

    if (newCustomRoleEmoji != null) {
        return newCustomRoleEmoji;
    }

    throw new Error(`Could not create emoji for role ${role.name}`);
}

async function getCustomRoleEmoji(emojis, role) {
    return emojis.cache.find(emoji => emoji.name === emojify(role.name));
}

async function makeCustomRoleEmoji(emojis, role) {
    let url = makeEmojiURL(role);
    await emojis.create(url, emojify(role.name));
}

function makeEmojiURL(role) {
    return `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`;
}

function emojify(text) {
    return text.replaceAll(DISALLOWED_EMOJI_CHARACTERS_REGEX, "_");
}

module.exports = {
    getRoles,
    getButtonRows,
    getOrMakeRoleEmojis,
    hasRole,
};
