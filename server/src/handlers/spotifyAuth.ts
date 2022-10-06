import { RequestHandler } from 'express';
import axios from 'axios';
import SpotifyToken from '../../../shared/SpotifyToken';
import config from '../config';

/**
 * Handler for Spotify OAuth processes, can:
 *
 * - Upgrade an authorization code to an access token (`?code=abc`).
 * - Refresh an access token with a refresh token (`?refresh_token=abc`).
 */
const spotifyAuth: RequestHandler = async (req, res) => {
    const origin = req.headers['origin'];

    if (typeof origin !== 'string') {
        return res.status(400).json({ message: `Header 'origin' must be a string, got ${typeof origin}` });
    }

    const code = req.query.code;
    const refreshToken = req.query.refresh_token;

    const body = new URLSearchParams();

    if (typeof code === 'string') {
        body.set('grant_type', 'authorization_code');
        body.set('code', code);
        body.set('redirect_uri', origin);
    } else if (typeof refreshToken === 'string') {
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', refreshToken);
    } else {
        return res.status(400).json({
            message: `One of 'code' or 'refresh_token' (in query) must be a string, got ${typeof code} and ${typeof refreshToken}`,
        });
    }

    try {
        const { data } = await axios.post<SpotifyToken>('https://accounts.spotify.com/api/token', body, {
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
