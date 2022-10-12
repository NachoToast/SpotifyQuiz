import { RequestHandler } from 'express';
import axios from 'axios';
import { SpotifyLoginToken } from '../../../shared/SpotifyTokens';
import config from '../config';

/**
 * Handler for Spotify OAuth processes, can:
 *
 * - Upgrade an authorization code to an access token (`?code=abc&redirect_uri=abc`).
 * - Refresh an access token with a refresh token (`?refresh_token=abc`).
 */
const spotifyAuth: RequestHandler = async (req, res) => {
    const redirectUri = req.query.redirect_uri;
    const code = req.query.code;
    const refreshToken = req.query.refresh_token;

    const body = new URLSearchParams();

    if (typeof code === 'string' && typeof redirectUri === 'string') {
        body.set('grant_type', 'authorization_code');
        body.set('code', code);
        body.set('redirect_uri', redirectUri);
    } else if (typeof refreshToken === 'string') {
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', refreshToken);
    } else {
        return res.status(400).json({
            message: `One of ('code' and 'redirect_uri') or 'refresh_token' (in query) must be a string, got ${typeof code}, ${typeof redirectUri} and ${typeof refreshToken} respectively`,
        });
    }

    try {
        const { data } = await axios.post<SpotifyLoginToken>('https://accounts.spotify.com/api/token', body, {
            auth: { username: config.spotifyClientId, password: config.spotifyClientSecret },
        });
        return res.status(200).json(data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status ?? 500).json(error.response?.data);
        }
        return res.sendStatus(500);
    }
};

export default spotifyAuth;
