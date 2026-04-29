// snoowrap dropped its bundled types after 1.20.x. Locked to 1.15.2 by
// `npm audit fix --force` to drop a vulnerable transitive `ws`, so we
// stub the module here. Tighten if a typed wrapper is adopted later.
declare module "snoowrap" {
    class Snoowrap {
        constructor(options: {
            userAgent: string;
            clientId: string;
            clientSecret: string;
            username?: string;
            password?: string;
            refreshToken?: string;
            accessToken?: string;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getRandomSubmission(subreddit?: string): Promise<any>;
    }

    export default Snoowrap;
}
