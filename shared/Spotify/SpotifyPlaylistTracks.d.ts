import SpotifyExternalURLs from './SpotifyExternalURL';
import SpotifyTrack from './SpotifyTrack';
import SpotifyUser from './SpotifyUser';

/**
 * {@link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlists-tracks API Reference}
 */
export default interface SpotifyPlaylistTracks {
    href: string;

    items: {
        added_at: string;
        added_by: {
            external_urls: SpotifyExternalURLs;
            href: string;
            id: string;
            type: 'user';
            uri: string;
        };
        is_local: boolean;
        primary_color: null;
        track: SpotifyTrack;
        video_thumbnail: { url: null };
    }[];

    /**
     *
     */
    limit: number;

    next: string | null;

    offset: number;

    previous: string | null;

    total: number;
}
