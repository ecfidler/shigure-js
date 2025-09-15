import {
    ActionRowBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
} from "discord.js";
import { getRoles } from "../roles/getRoles";
import { CHANGE_ROLES_CATEGORY_EVENT_ID } from "./constants";
import { getPaginatedRoleSelectionMessage } from "./getPaginatedRoleSelectionMessage";

export async function renderRoleChooser(
    client: Client<true>,
    interaction:
        | ChatInputCommandInteraction<"cached">
        | ButtonInteraction<"cached">
        | StringSelectMenuInteraction<"cached">,
    category: string = "interests",
    pageNumber: number = 0
): Promise<readonly ContainerBuilder[]> {
    const roles = await getRoles(client, category, interaction.guild);

    const { pageButtons, roleRows } = getPaginatedRoleSelectionMessage(
        roles,
        interaction.member,
        category,
        pageNumber
    );

    const header = new TextDisplayBuilder().setContent(
        "## Choose your roles!\nClick on a gray role to add it; click on a green role to remove it."
    );

    const container = new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addActionRowComponents(renderCategoryChooser(category))
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
        )
        .addActionRowComponents(roleRows);

    if (pageButtons != null) {
        container
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
            )
            .addActionRowComponents(pageButtons);
    }

    return [container];
}

function renderCategoryChooser(selectedCategory: string) {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder({
            customId: CHANGE_ROLES_CATEGORY_EVENT_ID,
            placeholder: "Choose a category",
        }).addOptions([
            new StringSelectMenuOptionBuilder({
                label: "Interests",
                value: "interests",
                description: "Games, hobbies, etc.",
                emoji: "🎮",
                default: selectedCategory === "interests",
            }),
            new StringSelectMenuOptionBuilder({
                label: "Languages",
                value: "languages",
                description: "parles-tu français?",
                emoji: "🗺",
                default: selectedCategory === "languages",
            }),
            new StringSelectMenuOptionBuilder({
                label: "Schools",
                value: "schools",
                description: "Congrats grad!",
                emoji: "🎓",
                default: selectedCategory === "schools",
            }),
        ])
    );
}
