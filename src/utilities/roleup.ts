import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    Guild,
    GuildEmoji,
    GuildEmojiManager,
    GuildMember,
    Role,
    type APIMessageComponentEmoji,
} from "discord.js";
import {
    DISALLOWED_EMOJI_CHARACTERS_REGEX,
    GUILDS,
    MAX_BUTTON_ROWS,
    MAX_BUTTONS_IN_ROW,
} from "./constants";

const MAX_ROLE_ROWS = MAX_BUTTON_ROWS - 1;
const MAX_ROLES_PER_PAGE = MAX_BUTTONS_IN_ROW * MAX_ROLE_ROWS;

interface RoleAndEmoji {
    readonly role: Role;
    readonly emoji: GuildEmoji | string | undefined;
}

export function getButtonRows(
    serverRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const sortedRoles = [...serverRoles].sort((a, b) =>
        a.role.name.localeCompare(b.role.name)
    );

    if (sortedRoles.length > MAX_BUTTON_ROWS * MAX_BUTTONS_IN_ROW) {
        return getButtonRowsWithPages(sortedRoles, member, category, page);
    }

    return getButtonRowsWithoutPages(sortedRoles, member);
}

function getButtonRowsWithoutPages(
    serverRoles: readonly RoleAndEmoji[],
    member: GuildMember
) {
    const rows = [];
    rows.push(...makeRoleRows(MAX_BUTTON_ROWS, serverRoles, member));
    return rows;
}

function getButtonRowsWithPages(
    allRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const rows = [];

    const numPages = Math.ceil(allRoles.length / MAX_ROLES_PER_PAGE);

    const rolesOnPage = allRoles.slice(
        page * MAX_ROLES_PER_PAGE,
        (page + 1) * MAX_ROLES_PER_PAGE
    );

    rows.push(...makeRoleRows(MAX_ROLE_ROWS, rolesOnPage, member));
    rows.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                label: "<",
                style: ButtonStyle.Primary,
                custom_id: `changeRolesPage_${category}_${page - 1}`,
                disabled: page === 0,
            }),
            new ButtonBuilder({
                label: ">",
                style: ButtonStyle.Primary,
                custom_id: `changeRolesPage_${category}_${page + 1}`,
                disabled: page + 1 === numPages,
            })
        )
    );
    return rows;
}

function makeRoleRows(
    numRows: number,
    roles: readonly RoleAndEmoji[],
    member: GuildMember
) {
    const rows = [];
    let i = 0;
    while (i < numRows && i * MAX_BUTTONS_IN_ROW < roles.length) {
        const rolesInRow = roles.slice(
            i * MAX_BUTTONS_IN_ROW,
            (i + 1) * MAX_BUTTONS_IN_ROW
        );
        const row = makeRowOfRoles(rolesInRow, member);
        rows.push(row);
        i++;
    }
    return rows;
}

function makeRowOfRoles(roles: readonly RoleAndEmoji[], member: GuildMember) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const role of roles) {
        row.addComponents(
            new ButtonBuilder({
                label: role.role.name,
                style: hasRole(member, role.role.id)
                    ? ButtonStyle.Success
                    : ButtonStyle.Secondary,
                emoji: convertGuildEmojiToButtonEmoji(role.emoji),
                custom_id: `toggleRoleButton_${role.role.id}`,
            })
        );
    }
    return row;
}

export function hasRole(member: GuildMember, id: string) {
    return member.roles.cache.has(id);
}

export async function getRoles(client: Client, category: string, guild: Guild) {
    const guildRoles = guild.roles.cache;
    const start = guildRoles.find(
        role => role.name === "#Category_" + category
    );
    const end = guildRoles.find(
        role => role.name === "#EndCategory_" + category
    );
    if (start == null || end == null) {
        console.error(
            `Could not determine the start and end of role category ${category}`
        );
        return [];
    }

    const roleEmojiServerManager = client.guilds.cache.get(GUILDS.ROLE)?.emojis;
    const roles: Role[] = [];

    for (const role of guildRoles.values()) {
        if (
            role.comparePositionTo(start) < 0 &&
            role.comparePositionTo(end) > 0
        ) {
            roles.push(role);
        }
    }

    // Side effect
    const rolesWithEmoji = await getOrMakeRoleEmojis(
        roleEmojiServerManager,
        roles
    );

    return rolesWithEmoji;
}

async function getOrMakeRoleEmojis(
    roleEmojiServerManager: GuildEmojiManager | undefined,
    roles: readonly Role[]
): Promise<RoleAndEmoji[]> {
    const rolesWithEmoji: RoleAndEmoji[] = await Promise.all(
        roles.map(
            async (role): Promise<RoleAndEmoji> => ({
                role,
                emoji: await resolveRoleEmoji(roleEmojiServerManager, role),
            })
        )
    );
    return rolesWithEmoji;
}

async function resolveRoleEmoji(
    roleEmojiServerManager: GuildEmojiManager | undefined,
    role: Role
) {
    if (roleEmojiServerManager == null) {
        return undefined;
    }

    if (role.unicodeEmoji != null) {
        // e.g. "💩"
        return role.unicodeEmoji;
    }

    // TODO: Support custom guild emoji as icon

    if (role.icon == null) {
        return undefined;
    }

    const customRoleEmoji = getCustomRoleEmoji(roleEmojiServerManager, role);

    if (customRoleEmoji != null) {
        return customRoleEmoji;
    }

    await makeCustomRoleEmoji(roleEmojiServerManager, role);
    const newCustomRoleEmoji = getCustomRoleEmoji(roleEmojiServerManager, role);

    if (newCustomRoleEmoji != null) {
        return newCustomRoleEmoji;
    }

    throw new Error(`Could not create emoji for role ${role.name}`);
}

function getCustomRoleEmoji(
    roleEmojiServerManager: GuildEmojiManager,
    role: Role
) {
    return roleEmojiServerManager.cache.find(
        emoji => emoji.name === emojify(role.name)
    );
}

async function makeCustomRoleEmoji(
    roleEmojiServerManager: GuildEmojiManager,
    role: Role
) {
    await roleEmojiServerManager.create({
        attachment: getEmojiUrlForRole(role),
        name: emojify(role.name),
    });
}

function getEmojiUrlForRole(role: Role) {
    return `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`;
}

function emojify(text: string) {
    return text.replaceAll(DISALLOWED_EMOJI_CHARACTERS_REGEX, "_");
}

function convertGuildEmojiToButtonEmoji(
    emoji: string | GuildEmoji | undefined
): APIMessageComponentEmoji | undefined {
    if (emoji instanceof GuildEmoji) {
        return {
            animated: emoji.animated ?? undefined,
            name: emoji.name ?? undefined,
            id: emoji.id,
        };
    }

    if (emoji == null) {
        return undefined;
    }

    return {
        animated: false,
        name: emoji,
        id: emoji,
    };
}

module.exports = {
    getRoles,
    getButtonRows,
    getOrMakeRoleEmojis,
    hasRole,
};
