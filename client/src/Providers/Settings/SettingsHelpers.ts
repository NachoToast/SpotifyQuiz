import { Settings, defaultSettings, SettingsSessionData } from '../../Contexts/Settings';

const KEY = 'spotifyQuiz.Settings';

export function getLocalSettings(): Settings {
    const existing = localStorage.getItem(KEY);
    if (existing !== null) {
        const existingSettings = JSON.parse(existing) as Settings;

        return { ...defaultSettings, ...existingSettings };
    }
    return { ...defaultSettings };
}

export function saveLocalSettings(s: Settings): void {
    localStorage.setItem(KEY, JSON.stringify(s));
}

export function generateSessionData(spotifyClientId: string, redirectUri: string): SettingsSessionData {
    let state = sessionStorage.getItem('spotifyQuiz.State');
    if (state === null) {
        state = new Array(32)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');
        sessionStorage.setItem('spotifyQuiz.State', state);
    }

    const linkParams = new URLSearchParams([
        ['response_type', 'code'],
        ['client_id', spotifyClientId],
        ['scope', 'playlist-read-private'],
        ['redirect_uri', redirectUri],
        ['state', state],
        ['show_dialog', 'true'],
    ]);

    const oAuthLink = `https://accounts.spotify.com/authorize?${linkParams.toString()}`;

    return { state, oAuthLink };
}
