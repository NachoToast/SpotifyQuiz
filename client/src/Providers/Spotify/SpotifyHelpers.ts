import axios from 'axios';
import SpotifyPlaylist from '../../../../shared/Spotify/SpotifyPlaylist';
import SpotifyPlaylists from '../../../../shared/Spotify/SpotifyPlaylists';
import SpotifyUser from '../../../../shared/Spotify/SpotifyUser';
import { Spotify } from '../../Contexts/Spotify';

const KEY = 'spotifyQuiz.Spotify';

export function getLocalSpotify(): Spotify | null {
    const existing = localStorage.getItem(KEY);
    if (existing !== null) {
        const existingPartial: Omit<Spotify, 'playlists'> = JSON.parse(existing);

        return { ...existingPartial, playlists: null };
    }
    return null;
}

export function saveLocalSpotify(s: Omit<Spotify, 'playlists'> | null): void {
    if (s === null) {
        localStorage.removeItem(KEY);
        return;
    }

    const newPartial: Omit<Spotify, 'playlists'> = { authData: s.authData, user: s.user };

    localStorage.setItem(KEY, JSON.stringify(newPartial));
}

export function getSecondsTillExpiry(s: Spotify): number {
    const expiresAt = new Date(s.authData.setAt).getTime() + 1000 * s.authData.expires_in;

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
