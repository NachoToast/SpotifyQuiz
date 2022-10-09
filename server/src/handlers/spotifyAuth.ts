import axios from 'axios';
import { APIResponse, ServerErrorResponse } from '../../../shared/SocketEvents';
import { SpotifyLoginToken, SpotifyRefreshToken } from '../../../shared/SpotifyToken';
import config from '../config';

function handleSpotifyError(e: unknown): ServerErrorResponse {
    if (axios.isAxiosError(e)) {
        if (typeof e.response?.data.error === 'string' && typeof e.response.data.error_description === 'string') {
            return {
                title: e.response.statusText,
                subtitle: e.response.data.error_description,
            };
        }

        return {
            title: 'Unknown Error',
            subtitle: 'An unknown error occurred',
            description: `${e.code}: ${e.message}`,
        };
    }

    return {
        title: 'Unknown Error',
        subtitle: 'An unknown error occurred',
    };
}

export async function spotifyLoginHandler(
    authorizationCode: string,
    redirectUri: string,
): Promise<APIResponse<SpotifyLoginToken>> {
    const body = new URLSearchParams([
        ['grant_type', 'authorization_code'],
        ['code', authorizationCode],
        ['redirect_uri', redirectUri],
    ]);

    try {
        const { data } = await axios.post<SpotifyLoginToken>('https://accounts.spotify.com/api/token', body, {
            auth: { username: config.spotifyClientId, password: config.spotifyClientSecret },
        });

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: handleSpotifyError(error),
        };
    }
}

export async function spotifyRefreshHandler(refreshToken: string): Promise<APIResponse<SpotifyRefreshToken>> {
    const body = new URLSearchParams([
        ['grant_type', 'refresh_token'],
        ['refresh_token', refreshToken],
    ]);

    try {
        const { data } = await axios.post<SpotifyRefreshToken>('https://accounts.spotify.com/api/token', body, {
            auth: { username: config.spotifyClientId, password: config.spotifyClientSecret },
        });

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: handleSpotifyError(error),
        };
    }
}
