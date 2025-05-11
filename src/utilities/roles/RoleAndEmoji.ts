import type { GuildEmoji, Role } from "discord.js";

export interface RoleAndEmoji {
    readonly role: Role;
    readonly emoji: GuildEmoji | string | undefined;
}
