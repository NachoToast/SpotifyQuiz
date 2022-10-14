import axios from 'axios';
import { Spotify } from '../../Contexts/Spotify';
import { SpotifyUser, SpotifyPlaylist, SpotifyPlaylists } from '../../../../shared/Spotify';

const KEY_AUTH = 'spotifyQuiz.Spotify.Auth';
const KEY_USER = 'spotifyQuiz.Spotify.User';

export function getLocalSpotify<T extends 'authData' | 'userData'>(key: T): Spotify[T] | null {
    const existing = localStorage.getItem(key === 'authData' ? KEY_AUTH : KEY_USER);
    if (existing !== null) {
        return JSON.parse(existing);
    }
    return null;
}

export function saveLocalSpotify<T extends 'authData' | 'userData'>(key: T, data: Spotify[T] | null): void {
    if (data === null) {
        localStorage.removeItem(key === 'authData' ? KEY_AUTH : KEY_USER);
        return;
    }

    localStorage.setItem(key === 'authData' ? KEY_AUTH : KEY_USER, JSON.stringify(data));
}

export function getSecondsTillExpiry(authData: Spotify['authData']): number {
    const expiresAt = new Date(authData.setAt).getTime() + 1000 * authData.expires_in;

    return Math.floor((expiresAt - Date.now()) / 1000);
}

export async function getCurrentUserProfile(accessToken: string, controller: AbortController): Promise<SpotifyUser> {
    const { data } = await axios.get<SpotifyUser>('/me', {
        signal: controller.signal,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        baseURL: 'https://api.spotify.com/v1',
    });

    return data;
}

export async function getAllCurrentUserPlaylists(
    accessToken: string,
    controller: AbortController,
): Promise<SpotifyPlaylist[]> {
    const collected = new Array<SpotifyPlaylist>();

    let numRequestsMade = 0;

    // if a user has more than 500 playlists I'm more concerned for their mental health
    // rather than this function not fetching all of the playlists
    const maxRequests = 10;

    let lastRequest: SpotifyPlaylists;

    do {
        const { data } = await axios.get<SpotifyPlaylists>('/me/playlists', {
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: 50,
                offset: 50 * numRequestsMade,
            },
            baseURL: 'https://api.spotify.com/v1',
        });
        collected.push(...data.items);
        lastRequest = data;
        numRequestsMade++;
    } while (lastRequest.next !== null && numRequestsMade <= maxRequests);

    return collected;
}
