const fs = require("fs");
const path = require("path");

const commandImports = new Map();

module.exports = {loadCommands, commandImports};

async function loadCommands(client) {
  console.info("Loading commands...");
  const commands = fs.readdirSync("./commands");

  const globalCommands = [];
  const specializedCommands = new Map();
  for (let i = 0; i < commands.length; i++) {
    const commandName = path.basename(commands[i], ".js");
    commandImports.set(commandName, require("../commands/" + commands[i]));
    const command = commandImports.get(commandName);
    command.commandData.name = commandName;
    if (command.guild === "global") {
      globalCommands.push(command.commandData);
    } else {
      if (specializedCommands.has(command.guild)) {
        specializedCommands.get(command.guild).push(command.commandData);
      } else {
        specializedCommands.set(command.guild, [command.commandData]);
      }
    }
    console.info(`Loaded command: ${commandName}`);
  }

  console.info("Commands loaded!\nRegistering commands...");

  const holUp = [];

  specializedCommands.forEach(async (specialCommands, guildID) => {
    const guild = client.guilds.cache.get(guildID);
    holUp.push(guild.commands.set(specialCommands));
  });

  // Testing only
  // const guild = client.guilds.cache.get("173840048343482368");
  // holUp.push(guild.commands.set(globalCommands));

  // Use in prod
  //holUp.push(client.application.commands.set(globalCommands));

  await Promise.all(holUp);

  console.info("Registered commands!");
}

function reloadCommands(client) {

}

function reloadCommand(client) {

}