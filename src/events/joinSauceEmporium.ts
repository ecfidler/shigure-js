import type { GuildMember } from "discord.js";
import { CHANNELS, ROLES, OWNER } from "../utilities/constants";

export async function joinSauceEmporiumEvent(member: GuildMember) {
    const moderator = await member.guild.members.fetch(OWNER);
    const welcomeMessage = `Ohayo ${member} \nWelcome to The Sauce Emporium! Please take a second to read the ${member.guild.channels.cache.get(
        CHANNELS.RULES
    )} channel before getting lost in the sauce. If you have any further inquires, feel free to ask ${moderator}.`;
    const valetChannel = member.guild.channels.cache.get(CHANNELS.VALET);
    if (valetChannel != null && valetChannel.isSendable()) {
        valetChannel.send(welcomeMessage);
    }
    const role = member.guild.roles.cache.get(ROLES.PATRON);
    if (role != null) {
        member.roles.add(role);
    }
}
