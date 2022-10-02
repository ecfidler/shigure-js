const fs = require("fs");
const path = require("path");

const commandImports = new Map();

module.exports = { loadCommands, commandImports };

async function loadCommands(client) {
    console.info("Loading commands...");
    const commands = fs.readdirSync("./commands");

    const globalCommands = [];
    const specializedCommands = new Map();
    for (let i = 0; i < commands.length; i++) {
        const commandName = path.basename(commands[i], ".js");
        commandImports.set(commandName, require("../commands/" + commands[i]));
        const command = commandImports.get(commandName);
        if (!command.commandData.name) {
            command.commandData.name = commandName;
        }
        if (command.guild === "global") {
            globalCommands.push(command.commandData);
        } else {
            if (specializedCommands.has(command.guild)) {
                specializedCommands
                    .get(command.guild)
                    .push(command.commandData);
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
        if (guild != undefined) {
            holUp.push(guild.commands.set(specialCommands));
        } else {
            console.log("command is not in guild");
        }
    });

    // Testing only
    // const guild = client.guilds.cache.get("173840048343482368");
    // holUp.push(guild.commands.set(globalCommands));

    // Use in prod
    holUp.push(client.application.commands.set(globalCommands));

    await Promise.all(holUp);

    console.info("Registered commands!");

    /*
  console.info("Setting permissions...");

  const holUp2 = [];

  client.guilds.cache.forEach((guild) => {
    guild.commands.cache.forEach((command) => {
      const commandImport = commandImports.get(command.name);
      if (commandImport.commandData.permissions) {
        holUp2.push(command.permissions.set({permissions: commandImport.commandData.permissions}));
      }
    });
  });

  client.application.commands.cache.forEach((command) => {
    const commandImport = commandImports.get(command.name);
    if (commandImport.commandData.permissions) {
      holUp2.push(command.permissions.set({permissions: commandImport.commandData.permissions}));
    }
  });

  await Promise.all(holUp2);

  console.info("Set permissions!");
  
  // Code to remove all commands from servers
  console.log("deleting all commands");
  await client.application.commands.fetch();
  client.application.commands.cache.forEach(async (command) => {
    console.log(`deleting ${command.name}`);
    await command.delete();
    console.log(`deleted ${command.name}`);
  });

  client.guilds.cache.forEach(async (guild) => {
    await guild.commands.fetch();
    guild.commands.cache.forEach(async (command) => {
      console.log(`deleting ${command.name}`);
      await command.delete();
      console.log(`deleted ${command.name}`);
    });
  });
  */
}

// function reloadCommands(client) {}

// function reloadCommand(client) {}
