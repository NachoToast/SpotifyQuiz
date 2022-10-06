import cors from 'cors';
import config from '../config';

const whitelist = new Set(config.clientURLs ?? [`http://localhost:3000`]);

export default cors({
    origin: (origin, callback) => {
        if (origin !== undefined && whitelist.has(origin)) callback(null, true);
        else callback(new Error(`Not allowed by CORS`));
    },
});
