import {
    GuildMember,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildEmoji,
    type APIMessageComponentEmoji,
} from "discord.js";
import { MAX_BUTTON_ROWS, MAX_BUTTONS_IN_ROW } from "../constants";
import { hasRole } from "./hasRole";
import type { RoleAndEmoji } from "./RoleAndEmoji";

export const MAX_ROLE_ROWS = MAX_BUTTON_ROWS - 1;
export const MAX_ROLES_PER_PAGE = MAX_BUTTONS_IN_ROW * MAX_ROLE_ROWS;

export function getPaginatedRoleSelectionMessage(
    serverRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const sortedRoles = [...serverRoles].sort((a, b) =>
        a.role.name.localeCompare(b.role.name)
    );

    if (sortedRoles.length > MAX_BUTTON_ROWS * MAX_BUTTONS_IN_ROW) {
        return getButtonRowsWithPages(sortedRoles, member, category, page);
    }

    return getButtonRowsWithoutPages(sortedRoles, member);
}

function getButtonRowsWithoutPages(
    serverRoles: readonly RoleAndEmoji[],
    member: GuildMember
) {
    const rows = [];
    rows.push(...makeRoleRows(MAX_BUTTON_ROWS, serverRoles, member));
    return rows;
}

function getButtonRowsWithPages(
    allRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const rows = [];

    const numPages = Math.ceil(allRoles.length / MAX_ROLES_PER_PAGE);

    const rolesOnPage = allRoles.slice(
        page * MAX_ROLES_PER_PAGE,
        (page + 1) * MAX_ROLES_PER_PAGE
    );

    rows.push(...makeRoleRows(MAX_ROLE_ROWS, rolesOnPage, member));
    rows.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                label: "<",
                style: ButtonStyle.Primary,
                custom_id: `changeRolesPage_${category}_${page - 1}`,
                disabled: page === 0,
            }),
            new ButtonBuilder({
                label: ">",
                style: ButtonStyle.Primary,
                custom_id: `changeRolesPage_${category}_${page + 1}`,
                disabled: page + 1 === numPages,
            })
        )
    );
    return rows;
}

function makeRoleRows(
    numRows: number,
    roles: readonly RoleAndEmoji[],
    member: GuildMember
) {
    const rows = [];
    let i = 0;
    while (i < numRows && i * MAX_BUTTONS_IN_ROW < roles.length) {
        const rolesInRow = roles.slice(
            i * MAX_BUTTONS_IN_ROW,
            (i + 1) * MAX_BUTTONS_IN_ROW
        );
        const row = makeRowOfRoles(rolesInRow, member);
        rows.push(row);
        i++;
    }
    return rows;
}

function makeRowOfRoles(roles: readonly RoleAndEmoji[], member: GuildMember) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const role of roles) {
        row.addComponents(
            new ButtonBuilder({
                label: role.role.name,
                style: hasRole(member, role.role.id)
                    ? ButtonStyle.Success
                    : ButtonStyle.Secondary,
                emoji: convertGuildEmojiToButtonEmoji(role.emoji),
                custom_id: `toggleRoleButton_${role.role.id}`,
            })
        );
    }
    return row;
}

function convertGuildEmojiToButtonEmoji(
    emoji: string | GuildEmoji | undefined
): APIMessageComponentEmoji | string | undefined {
    if (emoji instanceof GuildEmoji) {
        return {
            animated: emoji.animated ?? undefined,
            name: emoji.name ?? undefined,
            id: emoji.id,
        };
    }

    return emoji;
}
