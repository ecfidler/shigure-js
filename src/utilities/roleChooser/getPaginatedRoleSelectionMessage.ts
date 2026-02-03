import {
    GuildMember,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildEmoji,
    type APIMessageComponentEmoji,
} from "discord.js";
import { hasRole } from "../roles/hasRole";
import type { RoleAndEmoji } from "../roles/RoleAndEmoji";

/**
 * Note: this value must be <= 5 per API limits
 */
const MAX_BUTTONS_IN_ROW = 4;

const MAX_ROLE_ROWS = 6;
const MAX_ROLES_PER_PAGE = MAX_BUTTONS_IN_ROW * MAX_ROLE_ROWS;

export interface Return {
    readonly roleRows: ActionRowBuilder<ButtonBuilder>[];
    readonly pageButtons?: ActionRowBuilder<ButtonBuilder>;
}

export function getPaginatedRoleSelectionMessage(
    serverRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
): Return {
    const sortedRoles = [...serverRoles].sort((a, b) =>
        a.role.name.localeCompare(b.role.name)
    );

    if (sortedRoles.length <= MAX_ROLES_PER_PAGE) {
        return {
            roleRows: getButtonRowsWithoutPages(sortedRoles, member),
        };
    }

    return {
        roleRows: getButtonRowsWithPages(sortedRoles, member, category, page),
        pageButtons: getPageSwitchingRow(category, page, sortedRoles.length),
    };
}

function getButtonRowsWithoutPages(
    roles: readonly RoleAndEmoji[],
    member: GuildMember
) {
    return makeRoleRows(MAX_ROLE_ROWS, roles, member);
}

function getButtonRowsWithPages(
    allRoles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const rolesOnPage = allRoles.slice(
        page * MAX_ROLES_PER_PAGE,
        (page + 1) * MAX_ROLES_PER_PAGE
    );

    return makeRoleRows(MAX_ROLE_ROWS, rolesOnPage, member, category, page);
}

function getPageSwitchingRow(category: string, page: number, numRoles: number) {
    const numPages = Math.ceil(numRoles / MAX_ROLES_PER_PAGE);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
    );
}

function makeRoleRows(
    numRows: number,
    roles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        const rowStartIndex = i * MAX_BUTTONS_IN_ROW;
        const rowEndIndex = (i + 1) * MAX_BUTTONS_IN_ROW;
        if (rowStartIndex >= roles.length) {
            break;
        }

        const rolesInRow = roles.slice(rowStartIndex, rowEndIndex);
        const row = makeRowOfRoles(rolesInRow, member, category, page);
        rows.push(row);
    }
    return rows;
}

function makeRowOfRoles(
    roles: readonly RoleAndEmoji[],
    member: GuildMember,
    category: string,
    page: number
) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const role of roles) {
        row.addComponents(
            new ButtonBuilder({
                label: role.role.name,
                style: hasRole(member, role.role.id)
                    ? ButtonStyle.Success
                    : ButtonStyle.Secondary,
                emoji: convertGuildEmojiToButtonEmoji(role.emoji),
                custom_id: `toggleRoleButton_${category}_${page}_${role.role.id}`,
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
