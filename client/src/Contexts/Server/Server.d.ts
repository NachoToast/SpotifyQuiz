import { Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';

export type Server = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ServerControllers {
    restart(): void;
}

export interface IServerContext {
    server: Server;
    controllers: ServerControllers;
}
