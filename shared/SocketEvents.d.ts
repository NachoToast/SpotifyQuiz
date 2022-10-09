import { SpotifyLoginToken, SpotifyRefreshToken } from './SpotifyToken';

interface ServerErrorResponse {
    title: string;
    subtitle: string;
    description?: string;
}

type APIResponse<T> = { success: true; data: T } | { success: false; error: ServerErrorResponse };

interface ServerToClientEvents {
    spotifyLoginComplete: (newAuthData: APIResponse<SpotifyLoginToken>) => void;
    spotifyRefreshComplete: (newAuthData: APIResponse<SpotifyRefreshToken>) => void;
}

interface ClientToServerEvents {
    spotifyLogin: (authorizationCode: string, redirectUri: string) => void;
    spotifyRefresh: (refreshToken: string) => void;
}
