import type { ChatInputApplicationCommandData, Client } from "discord.js";
import fs from "fs";
import path from "path";
import type { CommandArgs } from "../types/CommandArgs";

interface CommandModule {
    readonly guild?: string;
    readonly guilds?: string;
    readonly action: (args: CommandArgs) => Promise<void>;
    readonly name: string;
    readonly commandData: ChatInputApplicationCommandData;
}

export const commandModuleByName = new Map<string, CommandModule>();

export async function loadCommands(client: Client<true>) {
    console.info("Loading commands...");
    const commandFilenames = fs.readdirSync("./src/commands");

    const globalCommands = [];
    const guildCommandDatasByGuildId = new Map<
        string,
        ChatInputApplicationCommandData[]
    >();
    for (const commandFilename of commandFilenames) {
        const commandName = path.basename(commandFilename, ".ts");
        const commandModule = await loadMutableCommandModule(commandFilename);

        commandModuleByName.set(commandName, commandModule);

        if (commandModule.commandData.name == null) {
            commandModule.commandData.name = commandName;
        }

        if (commandModule.guild === "global") {
            globalCommands.push(commandModule.commandData);
        } else if (commandModule.guild != null) {
            pushOrCreate(
                guildCommandDatasByGuildId,
                commandModule.guild,
                commandModule.commandData
            );
        } else if (commandModule.guilds != null) {
            for (const guild of commandModule.guilds) {
                pushOrCreate(
                    guildCommandDatasByGuildId,
                    guild,
                    commandModule.commandData
                );
            }
        }

        console.info(`Loaded command: ${commandName}`);
    }

    console.info("Commands loaded!\nRegistering commands...");

    const holUp = [];

    for (const [guildId, guildCommandDatas] of guildCommandDatasByGuildId) {
        const guild = client.guilds.cache.get(guildId);
        if (guild != null) {
            holUp.push(guild.commands.set(guildCommandDatas));
        } else {
            console.log(
                `could not find guild with ID ${guildId} when processing ${guildCommandDatas
                    .map(({ name }) => name)
                    .join(", ")}`
            );
        }
    }

    // Testing only
    // const guild = client.guilds.cache.get("173840048343482368");
    // holUp.push(guild.commands.set(globalCommands));

    // Use in prod
    holUp.push(client.application.commands.set(globalCommands));

    await Promise.all(holUp);

    console.info("Registered commands!");
}

async function loadMutableCommandModule(commandFilename: string) {
    return (await loadCommandModule(
        commandFilename
    )) as DeepMutable<CommandModule>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type DeepMutable<T> = T extends number | string | Function
    ? T
    : T extends ReadonlyArray<unknown>
    ? Mutable<T>
    : {
          -readonly [P in keyof T]: DeepMutable<T[P]>;
      };

type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

async function loadCommandModule(
    commandFilename: string
): Promise<CommandModule> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return import("../commands/" + commandFilename);
}

function pushOrCreate<K, V>(map: Map<K, V[]>, key: K, value: V) {
    if (map.has(key)) {
        map.get(key)!.push(value);
    } else {
        map.set(key, [value]);
    }
}
