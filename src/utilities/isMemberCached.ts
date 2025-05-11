import type { GuildMember, APIInteractionGuildMember } from "discord.js";

export function isMemberCached(
    member: GuildMember | APIInteractionGuildMember | null | undefined
): member is GuildMember {
    if (member == null) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(member, "client");
}
