const { CHANNELS, ROLES, OWNER } = require("../utilities/constants.js");

async function joinSauceEmporium(member) {
    let welcomeMessage = `Ohayo ${member} \nWelcome to Yoni's Sauce Emporium! Please take a second to read the ${member.guild.channels.cache.get(CHANNELS.RULES)} channel before getting lost in the sauce. If you have any further inquires, feel free to ask <@173839815400357888>.`;
    await member.guild.channels.cache.get(CHANNELS.VALET).send(welcomeMessage);
    member.roles.add(member.guild.roles.cache.get(ROLES.PATRON));
}

module.exports = { joinSauceEmporium };