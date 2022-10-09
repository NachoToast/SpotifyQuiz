import config from './config';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/SocketEvents';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { spotifyLoginHandler, spotifyRefreshHandler } from './handlers';

const whitelist = new Set(config.clientURLs ?? ['http://localhost:3000']);

const httpServer = createServer();

export const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin(requestOrigin, callback) {
            if (requestOrigin === undefined || whitelist.has(requestOrigin)) callback(null, true);
            else callback(new Error('Not allowed by CORS'));
        },
    },
});

io.on('connection', (s) => {
    console.log('connection!');

    s.on('spotifyLogin', async (accessToken, redirectUri) => {
        s.emit('spotifyLoginComplete', await spotifyLoginHandler(accessToken, redirectUri));
    });

    s.on('spotifyRefresh', async (refreshToken) => {
        s.emit('spotifyRefreshComplete', await spotifyRefreshHandler(refreshToken));
    });

    s.on('disconnect', () => console.log('disconnected'));
});

httpServer.listen(config.port ?? 3001, () => console.log(`Listening on ${config.port ?? 3001}`));
