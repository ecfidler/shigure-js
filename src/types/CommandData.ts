import type {
    ApplicationCommandOption,
    ApplicationCommandOptionType,
    ApplicationCommandType,
} from "discord.js";

export interface CommandData {
    readonly type: ApplicationCommandType;
    readonly description?: string;
    readonly permissions?: Permission[];
    readonly defaultPermission?: false;
    readonly options?: ApplicationCommandOption[];
}

export interface Permission {
    id: string;
    type: ApplicationCommandOptionType;
    permission: true;
}
