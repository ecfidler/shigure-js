import type { CommandArgs } from "../types/CommandArgs";
import { renderRoleChooser } from "../utilities/roleChooser/renderRoleChooser";

export async function changeRolesPageEvent({
    client,
    interaction,
}: CommandArgs) {
    if (!interaction.isButton()) {
        return;
    }

    if (!client.isReady()) {
        return;
    }

    const [category, pageNumberString] = interaction.customId
        .split("_")
        .slice(1);
    const pageNumber = Number.parseInt(pageNumberString ?? "");
    if (category == null || Number.isNaN(pageNumber)) {
        console.error("Invalid role page change event");
        return;
    }

    const components = await renderRoleChooser(
        client,
        interaction,
        category,
        pageNumber
    );

    await interaction.update({
        components: components,
    });
}
