import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    type TopLevelComponent,
} from "discord.js";
import { roleMenuHeader } from "../commands/roleup";
import type { CommandArgs } from "../types/CommandArgs";
import { isMemberCached } from "../utilities/isMemberCached";
import { hasRole } from "../utilities/roles/hasRole";

export async function toggleRoleButtonEvent({ interaction }: CommandArgs) {
    if (!interaction.isButton() || !isMemberCached(interaction.member)) {
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

    const newComponents: (
        | TopLevelComponent
        | ActionRowBuilder<ButtonBuilder>
    )[] = [];

    for (const component of interaction.message.components) {
        if (component.type !== ComponentType.ActionRow) {
            newComponents.push(component);
            continue;
        }

        const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>();
        for (const action of component.components) {
            if (action.type !== ComponentType.Button) {
                // We drop non-buttons here. There isn't a reasonable way to do this otherwise.
                continue;
            }
            const buttonBuilder = ButtonBuilder.from(action);
            if (action.customId === interaction.customId) {
                buttonBuilder.setStyle(toggleButtonStyle(action.style));
            }
            actionRowBuilder.addComponents(buttonBuilder);
        }
        newComponents.push(actionRowBuilder);
    }

    await interaction.update({
        embeds: [roleMenuHeader],
        components: newComponents,
    });
}

function toggleButtonStyle(style: ButtonStyle | undefined) {
    // Note: we only expect success or secondary.
    // If we encounter an unexpected value, then set it to secondary.

    if (style === ButtonStyle.Secondary) {
        return ButtonStyle.Success;
    }
    return ButtonStyle.Secondary;
}
