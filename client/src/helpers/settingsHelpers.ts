import Settings from '../types/Settings';

const KEY = 'spotifyQuiz.Settings';

export function defaultSettings(): Settings {
    return {
        serverUrl:
            window.location.host === 'localhost:3000'
                ? 'http://localhost:3001'
                : window.location.host === 'ntgc.ddns.net:3000'
                ? 'http://ntgc.ddns.net:3001'
                : 'production server not yet implemented',
        rateLimitBypassToken: null,
        spotifyClientId: '7fa87b67fc974969abb02a43bc7d0f60',
        redirectURI: window.location.origin + '/login',
        minRefresh: 30,
        maxRefresh: 30,
    };
}

export function getLocalSettings(): Settings {
    const existing = localStorage.getItem(KEY);
    if (existing !== null) {
        const existingSettings = JSON.parse(existing) as Settings;

        return { ...defaultSettings(), ...existingSettings };
    }
    return defaultSettings();
}

export function saveLocalSettings(s: Settings): void {
    localStorage.setItem(KEY, JSON.stringify(s));
}
