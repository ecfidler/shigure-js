import type { Message } from "discord.js";
import { GUILDS, ROLES } from "../utilities/constants";

const birthdayRoleByGuildId: Record<string, string> = {
    [GUILDS.WHID]: ROLES.BIRTHDAY,
    [GUILDS.TEST]: ROLES.BIRTHDAY_TEST,
};

export async function removeBirthdayOnEveryoneEvent(message: Message) {
    if (!message.inCachedGuild()) return;
    if (!message.mentions.everyone) return;

    const birthdayRoleId = birthdayRoleByGuildId[message.guild.id];
    if (birthdayRoleId == null) return;

    if (message.member == null) return;
    if (!message.member.roles.cache.has(birthdayRoleId)) return;

    try {
        await message.member.roles.remove(
            birthdayRoleId,
            "Pinged @everyone while holding the birthday role"
        );
    } catch (error) {
        console.error("Failed to remove birthday role after @everyone ping:", error);
    }
}
