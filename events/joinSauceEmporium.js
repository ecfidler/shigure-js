const { CHANNELS, ROLES, OWNER } = require("../utilities/constants.js");

function joinSauceEmporium(member) {
    let welcomeMessage = `Ohayo ${member} \nWelcome to Yoni's Sauce Emporium! Please take a second to read the ${member.guild.channels.cache.get(CHANNELS.RULES)} channel before getting lost in the sauce. If you have any further inquires, feel free to ask ${member.guild.members.get(OWNER)}.`;
    await member.guild.channels.cache.get(CHANNELS.VALET).send(welcomeMessage);
    member.roles.add(member.guild.roles.cache.get(ROLES.PATRON));
}

module.exports = { joinSauceEmporium };