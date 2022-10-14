import SpotifyPlaylist from './SpotifyPlaylist';

/** {@link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-list-of-current-users-playlists API Reference} */
export default interface SpotifyPlaylists {
    href: string;

    items: SpotifyPlaylist[];

    /**
     * 1 to 50 (inclusive).
     *
     * @default 20
     */
    limit: number;

    /** URL to next page of items. */
    next: string | null;

    /**
     * 0 to 100,000 (inclusive).
     *
     * @default 0
     */
    offset: number;

    /** URL to previous page of items. */
    previous: string | null;

    total: number;
}
