import SpotifyExternalURLs from './SpotifyExternalURLs';
import SpotifyTrack from './SpotifyTrack';

/**
 * {@link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlists-tracks API Reference}
 */
export default interface SpotifyPlaylistTracks {
    href: string;

    items: SpotifyTrack[];

    /**
     *
     */
    limit: number;

    next: string | null;

    offset: number;

    previous: string | null;

    total: number;
}
