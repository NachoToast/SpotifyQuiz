export interface Settings {
    /** Endpoint for the Spotify Quiz API. */
    serverUrl: string;

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

export interface SettingsControllers {
    setValue<T extends keyof Settings>(key: T, value: Settings[T]): void;
    resetValue<T extends keyof Settings>(key: T): void;
}

interface SettingsSessionData {
    state: string;
    oAuthLink: string;
}

export interface ISettingsContext {
    settings: Settings;
    controllers: SettingsControllers;
    sessionData: SettingsSessionData;
}
