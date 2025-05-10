import { CHANNELS, ROLES, OWNER } from "../utilities/constants";

async function joinSauceEmporiumEvent(member) {
    const moderator = await member.guild.members.fetch(OWNER);
    const welcomeMessage = `Ohayo ${member} \nWelcome to The Sauce Emporium! Please take a second to read the ${member.guild.channels.cache.get(
        CHANNELS.RULES
    )} channel before getting lost in the sauce. If you have any further inquires, feel free to ask ${moderator}.`;
    member.guild.channels.cache.get(CHANNELS.VALET).send(welcomeMessage);
    member.roles.add(member.guild.roles.cache.get(ROLES.PATRON));
}

module.exports = { joinSauceEmporiumEvent };
