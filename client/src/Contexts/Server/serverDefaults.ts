import { io } from 'socket.io-client';
import { defaultSettings } from '../Settings';
import { IServerContext, Server, ServerControllers } from './Server';

export const defaultServer: Server = io(defaultSettings.serverUrl);

export const defaultServerControllers: ServerControllers = {
    restart: function (): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultServerContext: IServerContext = {
    server: defaultServer,
    controllers: defaultServerControllers,
};
