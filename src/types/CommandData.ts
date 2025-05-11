import type {
    ChatInputApplicationCommandData,
    MessageApplicationCommandData,
    UserApplicationCommandData,
} from "discord.js";

export type CommandData =
    | ChatInputCommandData
    | MessageCommandData
    | UserCommandData;

export type ChatInputCommandData = WithoutName<
    RequireType<ChatInputApplicationCommandData>
>;

export type MessageCommandData = WithoutName<
    RequireType<MessageApplicationCommandData>
>;

export type UserCommandData = WithoutName<
    RequireType<UserApplicationCommandData>
>;

type WithoutName<T> = Omit<T, "name">;

type RequireType<T> = "type" extends keyof T ? Require<T, "type"> : never;

type Require<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;
