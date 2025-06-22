import type { Client, Interaction } from "discord.js";

export interface CommandArgs {
    readonly client: Client;
    readonly interaction: Interaction<"cached">;
}
