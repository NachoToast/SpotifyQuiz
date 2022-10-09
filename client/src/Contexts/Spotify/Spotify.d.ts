import { ServerErrorResponse } from '../../../../shared/SocketEvents';
import SpotifyPlaylist from '../../../../shared/Spotify/SpotifyPlaylist';
import SpotifyUser from '../../../../shared/Spotify/SpotifyUser';
import { SpotifyLoginToken } from '../../../../shared/SpotifyToken';
import { TypedEmitter } from 'tiny-typed-emitter';

/** Information about the user's Spotify OAuth session. */
interface Spotify {
    /** Access token, refresh token, and other OAuth credentials for the session. */
    authData: SpotifyLoginToken & { setAt: string };

    /**
     * The user associated with this access token.
     *
     * May be `null` if still loading.
     */
    user: SpotifyUser | null;

    /**
     * Playlists this user owns.
     *
     * May be `null` if still loading.
     */
    playlists: SpotifyPlaylist[] | null;
}

interface SpotifyControllers {
    /** Requests the server to upgrade an authorization code to an access token. */
    requestLogin(authorizationCode: string, redirectUri: string): Promise<true | ServerErrorResponse>;

    /** Requests the server to refresh an OAuth session. */
    requestRefresh(currentData: Spotify): Promise<true | ServerErrorResponse>;

    /** Clears local OAuth session. */
    logout(): void;
}

interface SpotifyEvents {
    loggedIn: (user: SpotifyUser) => void;
    loggedOut: () => void;
    refreshed: () => void;
}

interface ISpotifyContext {
    spotify: Spotify | null;
    controllers: SpotifyControllers;
    events: TypedEmitter<SpotifyEvents>;
}
