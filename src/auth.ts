import dotenv from "dotenv";

dotenv.config();

const {
    DISCORD_TOKEN,
    RuserAgent,
    RclientId,
    RclientSecret,
    Rusername,
    Rpassword,
    SauceNAOkey,
} = process.env;

if (DISCORD_TOKEN == null) {
    throw new Error("Missing environment variables");
}

export const auth = {
    DISCORD_TOKEN,
    RuserAgent,
    RclientId,
    RclientSecret,
    Rusername,
    Rpassword,
    SauceNAOkey,
};
