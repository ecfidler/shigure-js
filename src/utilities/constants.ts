const GUILDS = {
    WHID: "173840048343482368",
    YONI: "592214628550049794",
    TEST: "543283759407955974",
    ROLE: "906307865181048893",
    BEN_TESTING: "571004411137097731",
    GLOBAL: "global",
};

const CHANNELS = {
    LOW: "580587430776930314", // lowlights channel in what have i done

    RULES: "592216496659496990", // rules channel in sauce emporium
    VALET: "675182191520776214", // welcome channel in sauce emporium
    MILD: "592222434396995604", // chef's choice mild in sauce emporium
    SPICY: "592225505592344577", // chef's choice spicy in sauce emporium
    YPANTRY: "688202956599853199", // yoni's pantry in sauce emporium
    FPANTRY: "688213248163709112", // fops' pantry in sauce emporium
    TPANTRY: "771774117422301215", // tbone's pantry in sauce emporium
    KITCHEN: "698708633831211078", // kitchen in sauce emporium
    FINDER: "592225004410896405", // sauce finder in sauce emporium

    LOW_TEST: "674689826976694276", // spam in ben testing
};

const ROLES = {
    MAJOR: "374095810868019200",
    CHEF: "676571207323090944",
    PATRON: "592215547647754240",
    NSFW: "696441249309130774",
};

const EMOJIS = {
    PIN: "📌",
    SPEAK: "🕵",
};

const OWNER = "173839815400357888";

const BUTTON_ROW_MAX_LENGTH = 5;
const MAXIMUM_BUTTON_ROWS = 5;

/**
 * Regex of characters not allowed in emoji names, such as spaces or periods.
 */
const DISALLOWED_EMOJI_CHARACTERS_REGEX = /[ .]/g;

module.exports = {
    GUILDS,
    CHANNELS,
    ROLES,
    EMOJIS,
    OWNER,
    BUTTON_ROW_MAX_LENGTH,
    MAXIMUM_BUTTON_ROWS,
    DISALLOWED_EMOJI_CHARACTERS_REGEX,
};
