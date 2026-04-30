import {
    ApplicationCommandType,
    MessageFlags,
    PermissionFlagsBits,
} from "discord.js";
import type { CommandData } from "../types/CommandData";
import { CHANNELS, GUILDS, ROLES } from "../utilities/constants";
import type { CommandArgs } from "../types/CommandArgs";

const roleToGiveByGuildId = {
    [GUILDS.WHID]: ROLES.BIRTHDAY,
    [GUILDS.TEST]: ROLES.BIRTHDAY_TEST,
} as const;

const messageDestinationChannelByGuildId = {
    [GUILDS.WHID]: CHANNELS.DO,
    [GUILDS.TEST]: CHANNELS.DO_TEST,
} as const;

export const guilds = [GUILDS.WHID, GUILDS.TEST];

export const commandData: CommandData = {
    type: ApplicationCommandType.User,
    defaultMemberPermissions: PermissionFlagsBits.ManageRoles,
};

export async function action({ client, interaction }: CommandArgs) {
    if (!interaction.isUserContextMenuCommand()) {
        console.error("Unexpected interaction type");
        return;
    }

    if (interaction.targetMember == null) {
        console.error("Interaction called with no member");
        return;
    }

    const roleId = roleToGiveByGuildId[interaction.guild.id];
    if (roleId == null) {
        console.error("Guild does not have a role to give");
        return;
    }

    const destinationChannelId =
        messageDestinationChannelByGuildId[interaction.guild.id];
    if (destinationChannelId == null) {
        console.error(
            `Lowlights channel not configured for guild ${interaction.guild.name}`
        );
        return;
    }
    const destinationChannel = client.channels.cache.get(destinationChannelId);
    if (destinationChannel == null) {
        console.error(
            `Channel with id ${destinationChannel} not found in guild ${interaction.guild.name}`
        );
        return;
    }
    if (!destinationChannel.isSendable()) {
        console.error(
            `Channel with id ${destinationChannel} in guild ${interaction.guild.name} is not a text channel`
        );
        return;
    }

    try {
        await interaction.targetMember.roles.add(
            roleId,
            "Birthday role applied by " + interaction.user.tag
        );
    } catch (error) {
        console.error("Failed to add role:", error);
        await interaction.reply({
            content: `Failed to give ${interaction.targetMember} the @Birthday role.`,
            flags: MessageFlags.Ephemeral,
        });
        throw error;
    }

    const messageContent = `🎂 Happy Birthday <@${interaction.targetMember.id}>! 🎉`;

    const birthdayMessagePromise = destinationChannel.send({
        content: messageContent,
    });

    const successReplyPromise = interaction.reply({
        content: `Success!`,
        flags: MessageFlags.Ephemeral,
    });

    await Promise.all([birthdayMessagePromise, successReplyPromise]);
}
