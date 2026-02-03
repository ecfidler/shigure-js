import { ButtonStyle } from "discord.js";
import type { CommandArgs } from "../types/CommandArgs";
import { renderRoleChooser } from "../utilities/roleChooser/renderRoleChooser";
import { hasRole } from "../utilities/roles/hasRole";

export async function toggleRoleButtonEvent({
    interaction,
    client,
}: CommandArgs) {
    if (!client.isReady()) {
        return;
    }

    if (!interaction.isButton()) {
        return;
    }

    const [category, pageNumber, roleId] = interaction.customId.split("_");
    if (category == null || pageNumber == null || roleId == null) {
        console.error("Invalid row selection");
        return;
    }

    const memberHasRole = hasRole(interaction.member, roleId);
    if (memberHasRole) {
        await interaction.member.roles.remove(roleId);
    } else {
        await interaction.member.roles.add(roleId);
    }
    // TODO: How do we know that the button will render correctly?

    const roleChooser = await renderRoleChooser(
        client,
        interaction,
        category,
        Number(pageNumber) // TODO validate this
    );

    await interaction.update({
        components: roleChooser,
    });
}
