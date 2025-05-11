import { Client, Guild, GuildEmojiManager, Role } from "discord.js";
import { DISALLOWED_EMOJI_CHARACTERS_REGEX, GUILDS } from "./constants";
import type { RoleAndEmoji } from "./roles/RoleAndEmoji";

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
