import {
    ApplicationCommandType,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
} from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import type { CommandData } from "../types/CommandData";
import { GUILDS, ROLES } from "../utilities/constants";
import { hasRole } from "../utilities/roles/hasRole";

const roleToGiveByGuildId = {
    [GUILDS.WHID]: ROLES.MINOR,
    [GUILDS.BEN_TESTING]: ROLES.MINOR_TEST,
} as const;

export const guilds = Object.keys(roleToGiveByGuildId);

export const commandData: CommandData = {
    type: ApplicationCommandType.User,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
};

export async function action({ interaction }: CommandArgs) {
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

    if (hasRole(interaction.targetMember, roleId)) {
        await interaction.reply({
            content: `${interaction.targetMember} is already a minor.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    try {
        await interaction.targetMember.roles.add(
            roleId,
            "Admitted by " + interaction.user.tag
        );
    } catch (error) {
        console.error("Failed to add role:", error);
        await interaction.reply({
            content: `Failed to give ${interaction.targetMember} the @minors role.`,
            flags: MessageFlags.Ephemeral,
        });
        throw error;
    }

    const interactionReplyPromise = interaction.reply({
        content: `${interaction.targetMember} has been given @minors.`,
        flags: MessageFlags.Ephemeral,
    });
    const welcomeMessagePromise = interaction.guild.systemChannel?.send({
        content:
            `✈️ ${interaction.targetMember} welcome to _what have i done_!\n-# ` +
            getWelcomeSubtext(interaction.member),
    });

    await Promise.all([interactionReplyPromise, welcomeMessagePromise]);
}

function getWelcomeSubtext(major: GuildMember) {
    if (Math.random() < 0.99) {
        return `Your passport has been stamped by ${major}`;
    }

    const options = [
        `${major} was the guy standing there holding a sign with your name on it.`,
        `You were picked up from the airport by ${major}.`,
        `${major} held open the door for you.`,
        `You owe ${major} your life.`,
        `${major} wants you to remember that there is no #dont`,
        `Ping ${major} 25 times for a prize`,
    ];

    return options[Math.floor(Math.random() * options.length)];
}
