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

    const [, category, page, roleId] = interaction.customId.split("_");
    if (category == null || page == null || roleId == null) {
        console.error("Invalid row selection");
        return;
    }

    const pageNumber = Number(page);
    if (isNaN(pageNumber)) {
        console.error("Invalid page number");
        return;
    }

    const memberHasRole = hasRole(interaction.member, roleId);
    if (memberHasRole) {
        await interaction.member.roles.remove(roleId);
    } else {
        await interaction.member.roles.add(roleId);
    }

    const roleChooser = await renderRoleChooser(
        client,
        interaction,
        category,
        pageNumber
    );

    await interaction.update({
        components: roleChooser,
    });
}
