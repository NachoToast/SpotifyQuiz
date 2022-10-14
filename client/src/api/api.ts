import axios, { AxiosRequestConfig } from 'axios';
import { SpotifyLoginToken, SpotifyRefreshToken } from '../../../shared/SpotifyTokens';
import ServerErrorResponse from '../types/ServerErrorResponse';

type APIResponse<T> = { success: true; data: T } | { success: false; error: ServerErrorResponse };

function handleErrorResponse(e: unknown): ServerErrorResponse {
    if (!axios.isAxiosError(e)) {
        return {
            title: 'Unknown Error',
            subtitle: 'An unknown error occurred',
            data: e,
        };
    }

    // ratelimited
    if (e.response?.status === 429) {
        const rateLimitInfo = {
            limit: Number(e.response.headers['ratelimit-limit']),
            remaining: Number(e.response.headers['ratelimit-remaining']),
            resetsIn: Number(e.response.headers['ratelimit-reset']),
            windowSize: Number(e.response.headers['retry-after']),
        };
        return {
            title: 'Rate Limited',
            subtitle: 'You are making too many requests',
            description: `Please wait ${rateLimitInfo.resetsIn} seconds before trying again`,
            data: rateLimitInfo,
        };
    }

    if (typeof e.response?.data.title === 'string' && typeof e.response.data.subtitle === 'string') {
        return {
            title: e.response.data.title,
            subtitle: e.response.data.subtitle,
            description: e.response.data.description,
            data: e,
        };
    }

    // expected JSON shape
    if (typeof e.response?.data.message === 'string') {
        return {
            title: e.response.statusText,
            subtitle: e.message,
            description: e.response.data.message,
            data: e.response,
        };
    }

    // expected JSON shape (Spotify-specific)
    if (typeof e.response?.data.error_description === 'string') {
        return {
            title: e.response.statusText,
            subtitle: e.response.data.error_description,
            data: e.response,
        };
    }

    // 404 or CORS
    if (e.code === 'ERR_NETWORK' || e.response?.status === 404) {
        return {
            title: 'Network Error',
            subtitle: 'Failed to connect to the server',
            data: e.response,
        };
    }

    // any other Axios error
    return {
        title: 'Unknown Error',
        subtitle: 'An unknown error occurred',
        description: `${e.code}: ${e.message}`,
        data: e.response,
    };
}

export async function requestSpotifyAccessToken(
    serverUrl: string,
    authorizationCode: string,
    redirectUri: string,
    rateLimitBypassToken: string,
): Promise<APIResponse<SpotifyLoginToken>> {
    try {
        const config: AxiosRequestConfig = {
            baseURL: serverUrl,
            params: {
                code: authorizationCode,
                redirect_uri: redirectUri,
            },
            headers: {},
        };

        if (rateLimitBypassToken !== '') config.headers!['RateLimit-Bypass-Token'] = rateLimitBypassToken;

        const { data } = await axios.get<SpotifyLoginToken>('/auth', config);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: handleErrorResponse(error),
        };
    }
}

export async function refreshSpotifyAccessToken(
    serverUrl: string,
    refreshToken: string,
    rateLimitBypassToken: string,
): Promise<APIResponse<SpotifyRefreshToken>> {
    try {
        const config: AxiosRequestConfig = {
            baseURL: serverUrl,
            params: {
                refresh_token: refreshToken,
            },
            headers: {},
        };

        if (rateLimitBypassToken !== '') config.headers!['RateLimit-Bypass-Token'] = rateLimitBypassToken;

        const { data } = await axios.get<SpotifyRefreshToken>('/auth', config);

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: handleErrorResponse(error),
        };
    }
}

export async function createGame(serverUrl: string, rateLimitBypassToken: string): Promise<APIResponse<string>> {
    try {
        const config: AxiosRequestConfig = {
            headers: {},
        };

        if (rateLimitBypassToken !== '') config.headers!['RateLimit-Bypass-Token'] = rateLimitBypassToken;

        const { data } = await axios.post<string>(`${serverUrl}/game`, config);

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: handleErrorResponse(error),
        };
    }
}
