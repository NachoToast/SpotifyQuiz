import axios from 'axios';
import { SpotifyPlaylistTracks, SpotifyTrack } from '../../../shared/Spotify';

export async function getAllPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]> {
    const collected = new Array<SpotifyTrack>();

    let numRequestsMade = 0;

    // we'll probably get ratelimited before then lmao
    const maxRequests = 100;

    let lastRequest: SpotifyPlaylistTracks;

    do {
        const { data } = await axios.get<SpotifyPlaylistTracks>(`/playlists/${playlistId}/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: 50,
                offset: 50 * numRequestsMade,
            },
            baseURL: 'https://api.spotify.com/v1',
        });
        collected.push(...data.items.map((e) => e.track));
        lastRequest = data;
        numRequestsMade++;
    } while (lastRequest.next !== null && numRequestsMade <= maxRequests);

    return collected;
}
