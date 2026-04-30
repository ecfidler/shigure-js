import { z } from "zod";

export interface RedditCreds {
    userAgent: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
}

const TOKEN_ENDPOINT = "https://www.reddit.com/api/v1/access_token";
const OAUTH_BASE = "https://oauth.reddit.com";

// Refresh slightly before expiry so a request issued right at the boundary
// doesn't race the token going stale.
const TOKEN_REFRESH_MARGIN_SECONDS = 60;

const TokenResponseSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
});

const RedditPostSchema = z.object({
    selftext: z.string(),
    url: z.string(),
});

export type RedditPost = z.infer<typeof RedditPostSchema>;

const RedditListingSchema = z.object({
    data: z.object({
        children: z.array(z.object({ data: RedditPostSchema })),
    }),
});

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(creds: RedditCreds): Promise<string> {
    const now = Date.now();
    if (cachedToken != null && cachedToken.expiresAt > now) {
        return cachedToken.token;
    }

    const basic = Buffer.from(
        `${creds.clientId}:${creds.clientSecret}`
    ).toString("base64");
    const body = new URLSearchParams({
        grant_type: "password",
        username: creds.username,
        password: creds.password,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": creds.userAgent,
        },
        body,
    });

    if (!response.ok) {
        throw new Error(
            `Reddit token request failed: ${response.status} ${response.statusText}`
        );
    }

    const json: unknown = await response.json();
    const parsed = TokenResponseSchema.parse(json);

    cachedToken = {
        token: parsed.access_token,
        expiresAt:
            now + (parsed.expires_in - TOKEN_REFRESH_MARGIN_SECONDS) * 1000,
    };
    return cachedToken.token;
}

// `/r/SUB/random` 400s under OAuth (Reddit disabled it during the 2023 API
// lockdown). Pulling /hot and selecting client-side gives us the same
// outward behavior — a random submission from the subreddit.
const HOT_LISTING_LIMIT = 100;

export async function getRandomSubmission(
    subreddit: string,
    creds: RedditCreds
): Promise<RedditPost> {
    const token = await getAccessToken(creds);

    const response = await fetch(
        `${OAUTH_BASE}/r/${encodeURIComponent(subreddit)}/hot?limit=${HOT_LISTING_LIMIT}&raw_json=1`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": creds.userAgent,
            },
        }
    );

    if (!response.ok) {
        const body = await response.text().catch(() => "<unreadable>");
        throw new Error(
            `Reddit hot listing request failed: ${response.status} ${response.statusText} (final URL: ${response.url}) — body: ${body.slice(0, 500)}`
        );
    }

    const json: unknown = await response.json();
    const listing = RedditListingSchema.parse(json);
    const children = listing.data.children;
    if (children.length === 0) {
        throw new Error(`Reddit /hot returned no children for r/${subreddit}`);
    }

    const child = children[Math.floor(Math.random() * children.length)];
    if (child == null) {
        throw new Error("Random index out of bounds");
    }
    return child.data;
}
