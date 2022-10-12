import SpotifyExternalURLs from './SpotifyExternalURLs';
import SpotifyImage from './SpotifyImage';

/**{@link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist API Reference} */
export default interface SpotifyPlaylist {
    /** Whether the owner allows other users to modify this playlist. */
    collaborative: boolean;

    description: string | null;

    external_urls: SpotifyExternalURLs;

    href: string;

    id: string;

    /**
     * Images for this playlist.
     *
     * May contain up to 3 images, will expire in less than a day.
     *
     * Sorted by size in descending order.
     */
    images: SpotifyImage[];

    name: string;

    owner: {
        display_name: string;

        /** Known public external URLs for this user. */
        external_urls: {
            spotify: string;
        };

        href: string;

        id: string;

        type: 'user';

        uri: string;
    };
    primary_color: null;

    /**
     * Whether the playlist is public (true), private (false), or irrelevant (`null`).
     *
     * For more information see {@link https://developer.spotify.com/documentation/general/guides/working-with-playlists/ Working with Playlists}.
     */
    public: boolean | null;

    snapshot_id: string;

    tracks: {
        href: string;

        total: number;
    };

    type: 'playlist';

    uri: string;
}
