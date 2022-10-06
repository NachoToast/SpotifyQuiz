import express from 'express';
import config from './config';
import { spotifyAuth } from './handlers';
import { corsHandler, customErrorHandler, customRateLimiter } from './middleware';

const app = express();

app.use(corsHandler);
app.use(customErrorHandler);
app.use(customRateLimiter);

app.set(`trust proxy`, config.numProxies ?? 0);

app.get(`/ip`, (req, res) => res.status(200).send(req.ip));

app.get(`/`, (_, res) =>
    res.status(200).send({
        startTime: config.startedAt,
        version: config.version,
    }),
);

app.get(`/auth`, spotifyAuth);

app.listen(config.port ?? 3001, () => console.log(`Listening on ${config.port ?? 3001}`));
