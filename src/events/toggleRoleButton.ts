import {
    ButtonComponent,
    ButtonStyle,
    ComponentType,
    type MessageActionRowComponent,
    type TopLevelComponent,
} from "discord.js";
import { roleMenuHeader } from "../commands/roleup";
import type { CommandArgs } from "../types/CommandArgs";
import { hasRole } from "../utilities/roles/hasRole";

export async function toggleRoleButtonEvent({ interaction }: CommandArgs) {
    if (!interaction.isButton()) {
        return;
    }

    const roleId = interaction.customId.split("_")[1];
    if (roleId == null) {
        console.error("Invalid row selection");
        return;
    }

    const memberHasRole = hasRole(interaction.member, roleId);
    if (memberHasRole) {
        await interaction.member.roles.remove(roleId);
    } else {
        await interaction.member.roles.add(roleId);
    }

    const newComponents: TopLevelComponent[] = [];
    for (const row of interaction.message.components) {
        if (row.type !== ComponentType.ActionRow) {
            newComponents.push(row);
            continue;
        }

        const actions: MessageActionRowComponent[] = [];
        for (const action of row.components) {
            if (
                action.type !== ComponentType.Button ||
                action.customId !== interaction.customId
            ) {
                actions.push(action);
                continue;
            }

            actions.push({
                ...action,
                style: memberHasRole
                    ? ButtonStyle.Secondary
                    : ButtonStyle.Success,
            } as ButtonComponent);
        }
    }

    await interaction.update({
        embeds: [roleMenuHeader],
        components: newComponents,
    });
}
