import axios, { AxiosRequestConfig } from 'axios';
import SpotifyToken from '../../shared/Spotify/SpotifyToken';
import SpotifyUser from '../../shared/Spotify/SpotifyUser';
import { ExtendedSpotifyToken } from './helpers/SpotifyAuthHelpers';

const Spotify = axios.create({
    baseURL: 'https://api.spotify.com/v1',
});

export interface ServerErrorResponse {
    title: string;
    subtitle: string;
    description?: string;
    data: unknown;
}

export interface OptionalServerRequestArgs {
    controller?: AbortController;
    rateLimitBypassToken?: string | null;
}

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

async function requestSpotifyAccessToken(
    serverUrl: string,
    authorizationCode: string,
    options?: OptionalServerRequestArgs,
): Promise<APIResponse<ExtendedSpotifyToken>> {
    try {
        const config: AxiosRequestConfig = {
            baseURL: serverUrl,
            params: {
                code: authorizationCode,
            },
            headers: {},
        };

        if (options?.controller) config.signal = options.controller.signal;
        if (options?.rateLimitBypassToken) config.headers!['RateLimit-Bypass-Token'] = options.rateLimitBypassToken;

        const { data } = await axios.get<SpotifyToken>('/auth', config);
        return { success: true, data: { ...data, setAt: Date.now() } };
    } catch (error) {
        return {
            success: false,
            error: handleErrorResponse(error),
        };
    }
}

async function refreshSpotifyAccessToken(
    serverUrl: string,
    refreshToken: string,
    options?: OptionalServerRequestArgs,
): Promise<APIResponse<ExtendedSpotifyToken>> {
    try {
        const config: AxiosRequestConfig = {
            baseURL: serverUrl,
            params: {
                refresh_token: refreshToken,
            },
            headers: {},
        };

        if (options?.controller) config.signal = options.controller.signal;
        if (options?.rateLimitBypassToken) config.headers!['RateLimit-Bypass-Token'] = options.rateLimitBypassToken;

        const { data } = await axios.get<SpotifyToken>('/auth', config);

        return {
            success: true,
            data: {
                ...data,
                setAt: Date.now(),
                refresh_token: data.refresh_token ?? refreshToken,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: handleErrorResponse(error),
        };
    }
}

async function getCurrentUserProfile(accessToken: string, controller = new AbortController()): Promise<SpotifyUser> {
    const { data } = await Spotify.get<SpotifyUser>('/me', {
        signal: controller.signal,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return data;
}

const api = { requestSpotifyAccessToken, refreshSpotifyAccessToken, Spotify: { getCurrentUserProfile } };

export default api;
