import type { CommandArgs } from "../types/CommandArgs";
import { renderRoleChooser } from "../utilities/roleChooser/renderRoleChooser";

export async function changeRolesCategoryEvent({
    client,
    interaction,
}: CommandArgs) {
    if (!client.isReady()) {
        console.error("Client was not ready");
        return;
    }

    if (!interaction.isStringSelectMenu()) {
        console.error(
            "Change roles category interaction is not from string select menu"
        );
        return;
    }

    const category = interaction.values[0];
    if (interaction.values.length !== 1 || category == null) {
        // TODO: Error response
        console.error("Role category not found in category change event");
        return;
    }

    if (category == null) {
        console.error("Invalid role category change event");
        return;
    }

    const components = await renderRoleChooser(client, interaction, category);

    await interaction.update({
        components: components,
    });
}
