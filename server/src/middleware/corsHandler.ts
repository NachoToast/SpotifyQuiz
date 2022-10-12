import cors from 'cors';
import config from '../config';

const whitelist = new Set(config.clientURLs ?? ['http://localhost:3001']);

/**
 * CORS policy for the site whitelist defined in `config.json`.
 *
 * We allow API requests from all locations, but only set the 'Access-Control-Allow-Origin' header to one of the
 * whitelisted URLs.
 */
export default cors({
    origin: (origin, callback) => {
        // origin is undefined on non-browser requests (e.g. Postman, Insomnia, or server-side requests)
        if (origin === undefined || whitelist.has(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS '));
    },
    exposedHeaders: [
        'RateLimit-Limit',
        'RateLimit-Remaining',
        'RateLimit-Reset',
        'Retry-After',
        'RateLimit-Bypass-Response',
    ],
});
