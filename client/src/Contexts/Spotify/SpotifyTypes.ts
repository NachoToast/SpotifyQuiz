import { TypedEmitter } from 'tiny-typed-emitter';
import SpotifyPlaylist from '../../types/Spotify/SpotifyPlaylist';
import SpotifyUser from '../../types/Spotify/SpotifyUser';
import { SpotifyLoginToken } from '../../../../shared/SpotifyTokens';
import ServerErrorResponse from '../../types/ServerErrorResponse';

export interface Spotify {
    authData: SpotifyLoginToken & { setAt: string };
    userData: SpotifyUser | null;
    playlists: SpotifyPlaylist[] | null;
}

export interface SpotifyControllers {
    /** Requests the server to upgrade an authorization code to an access token. */
    requestLogin(authorizationCode: string, redirectUri: string): Promise<true | ServerErrorResponse>;

    /** Requests the server to refresh an OAuth session. */
    requestRefresh(currentData: Spotify['authData']): Promise<true | ServerErrorResponse>;

    /** Clears local OAuth session. */
    logout(): void;
}

export interface SpotifyEvents {
    loggedIn: (user: SpotifyUser) => void;
    loggedOut: () => void;
    refreshed: () => void;
}

export interface ISpotifyContext {
    spotify: Spotify | null;
    controllers: SpotifyControllers;
    events: TypedEmitter<SpotifyEvents>;
}
