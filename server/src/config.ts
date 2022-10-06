import { existsSync } from 'fs';

export interface Config {
    /**
     * Port for server to run on.
     *
     * @default 3001
     */
    port?: number;

    /**
     * Client origin URLs for server to use in CORS middleware.
     *
     * @default ["http://localhost:3000"]
     */
    clientURLs?: string[];

    /**
     * Number of proxies (such as Cloudflare, AWS ELB, or Nginx) to skip for ratelimiting functionality.
     *
     * For more information see the {@link https://www.npmjs.com/package/express-rate-limit#:~:text=Troubleshooting%20Proxy%20Issues Express Rate Limit docs}.
     *
     * @default 0
     */
    numProxies?: 0;

    /**
     * Maximum number requests a user is allowed to make to the API in a 1 minute window.
     *
     * Requests with a valid "RateLimit-Bypass-Token" header will not contribute towards
     * this value.
     *
     * @default 30
     */
    maxRequestsPerMinute?: number;

    /**
     * Requests with any of these values in their
     * "RateLimit-Bypass-Token" header will bypass rate limiting.
     *
     * @default []
     */
    rateLimitBypassTokens?: string[];

    /**
     * Make a Spotify application at
     * {@link https://developer.spotify.com/dashboard/applications}
     */
    spotifyClientId: string;

    spotifyClientSecret: string;

    /**
     * Do not include this in your `config.json` file, it is automatically read from
     * the root `package.json` file.
     */
    version: string;

    /** Do not include this in your `config.json` file, it is automatically created. */
    startedAt: string;
}

const config: Config = existsSync('config.json') ? require('../config.json') : require('../config.example.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
config.version = process.env.NPM_VERSION || require('../package.json').version;

config.startedAt = new Date().toISOString();

export default config;
