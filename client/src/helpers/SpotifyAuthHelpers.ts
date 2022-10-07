import SpotifyToken from '../../../shared/Spotify/SpotifyToken';
import Settings from '../types/Settings';

const KEY = 'spotifyQuiz.Auth';

export interface ExtendedSpotifyToken extends SpotifyToken {
    setAt: number;
}

function getOrMakeSessionState(): string {
    const existing = sessionStorage.getItem('state');
    if (existing !== null) return existing;

    const newState = new Array(32)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');

    sessionStorage.setItem('state', newState);

    return newState;
}

/**
 * CSRF-preventing state to send as a query parameter when making Spotify OAuth2 authorization requests.
 *
 * This is session bound, meaning it will be different if the user does OAuth2 in another tab.
 */
export const sessionState = getOrMakeSessionState();
/**
 * Makes a Spotify OAuth2 authorization URL for the configured client ID and scopes.
 */
export function makeOAuthLink(s: Settings): string {
    const params = new URLSearchParams([
        ['response_type', 'code'],
        ['client_id', s.spotifyClientId],
        ['scope', 'playlist-read-private'],
        ['redirect_uri', origin],
        ['state', sessionState],
        ['show_dialog', 'true'],
    ]);

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function getLocalSpotifyAuth(): ExtendedSpotifyToken | null {
    const existingAuth = localStorage.getItem(KEY);
    if (existingAuth === null) return null;
    return JSON.parse(existingAuth);
}

export function saveLocalSpotifyAuth(auth: ExtendedSpotifyToken) {
    localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearLocalSpotifyAuth() {
    localStorage.removeItem(KEY);
}

/** Returns the number of seconds until the current access token expires. */
export function getTimeTillExpiry(auth: ExtendedSpotifyToken): number {
    const expiresAt = auth.setAt + 1000 * auth.expires_in;
    return (expiresAt - Date.now()) / 1000;
}
