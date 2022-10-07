import SpotifyExternalURLs from './SpotifyExternalURLs';
import SpotifyImage from './SpotifyImage';

/**
 * Detailed profile information about the current user.
 *
 * Note this is assuming no scopes are requested.
 *
 * {@link https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile API Reference}
 */
export default interface SpotifyUser {
    display_name: string | null;

    external_urls: SpotifyExternalURLs;

    followers: {
        /** @deprecated This will always be `null`, as the Web API does not support it at the moment. */
        href: null;

        total: number;
    };

    href: string;

    id: string;

    images: SpotifyImage[];

    type: `user`;

    uri: string;
}
