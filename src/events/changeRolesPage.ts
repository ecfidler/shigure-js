import type { CommandArgs } from "../types/CommandArgs";
import { isMemberCached } from "../utilities/isMemberCached";
import { getPaginatedRoleSelectionMessage } from "../utilities/roles/getPaginatedRoleSelectionMessage";
import { getRoles } from "../utilities/roleup";

export async function changeRolesPageEvent({
    client,
    interaction,
}: CommandArgs) {
    if (
        !interaction.isButton() ||
        !isMemberCached(interaction.member) ||
        interaction.guild == null
    ) {
        return;
    }

    const [category, pageNumber] = interaction.customId.split("_").slice(1);
    if (category == null || pageNumber == null) {
        console.error("Invalid role change event");
        return;
    }

    const components = getPaginatedRoleSelectionMessage(
        await getRoles(client, category, interaction.guild),
        interaction.member,
        category,
        parseInt(pageNumber)
    );

    await interaction.update({
        components: components,
    });
}
