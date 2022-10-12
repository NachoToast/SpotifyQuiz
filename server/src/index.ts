import { createServer } from 'http';
import express from 'express';
import config from './config';
import { corsHandler, customErrorHandler, customRateLimiter } from './middleware';
import { createGame, spotifyAuth } from './handlers';
import Game from './classes/Game';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/SocketEvents';

const app = express();

app.use(customErrorHandler);
app.use(customRateLimiter);
app.use(corsHandler);

app.set('trust proxy', config.numProxies ?? 0);

app.get('/', (_, res) => res.status(200).json({ startTime: config.startedAt, version: config.version }));

app.get('/ip', (req, res) => res.status(200).send(req.ip));

app.get('/auth', spotifyAuth);

app.post('/game', createGame);

const httpServer = createServer(app);

httpServer.listen(config.port ?? 3001, () => {
    console.log(`Listening on ${config.port ?? 3001}`);
});

/** Games mapped by their codes. */
export const gameCodeMap = new Map<string, Game>();

export const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { ...corsHandler },
});

io.on('connect', (socket) => {
    const gameCode = socket.handshake.auth.gameCode;
    if (typeof gameCode !== 'string') {
        socket.disconnect();
        return;
    }

    const game = gameCodeMap.get(gameCode);

    if (game === undefined) {
        socket.disconnect();
        return;
    }

    game.handleJoin(socket);
});
