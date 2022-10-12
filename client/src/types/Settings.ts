export default interface Settings {
    /** Endpoint for the Spotify Quiz API. */
    serverUrl: string;

    rateLimitBypassToken: string | null;

    spotifyClientId: string;

    /** @default window.location.origin + '/login' */
    redirectURI: string;

    /**
     * Will not try to refresh tokens if they expire in less than
     * this many seconds.
     *
     * @default 30
     */
    minRefresh: number;

    /**
     * Will try to refresh tokens if they expire in this many **minutes**
     * or less.
     *
     * @default 30
     */
    maxRefresh: number;
}
