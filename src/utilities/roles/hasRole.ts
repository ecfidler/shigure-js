import type { GuildMember } from "discord.js";

export function hasRole(member: GuildMember, id: string) {
    return member.roles.cache.has(id);
}
