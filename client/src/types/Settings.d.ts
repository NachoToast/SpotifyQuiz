export default interface Settings {
    /** Endpoint for the Spotify Quiz API. */
    serverUrl: string;

    rateLimitBypassToken: string | null;

    spotifyClientId: string;

    redirectURI: string;
}
