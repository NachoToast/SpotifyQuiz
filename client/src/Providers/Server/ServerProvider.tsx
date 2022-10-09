import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { SettingsContext } from '../../Contexts';
import { defaultServer, IServerContext, Server, ServerContext, ServerControllers } from '../../Contexts/Server';

const ServerContextProvider = ({ children }: { children: ReactNode }) => {
    const [server, setServer] = useState<Server>(defaultServer);

    const { settings } = useContext(SettingsContext);

    const restart = useCallback<ServerControllers['restart']>(() => {
        server.disconnect();
        setServer(io(settings.serverUrl));
    }, [server, settings.serverUrl]);

    useEffect(() => {
        server.on('connect', () => console.log('connect'));
        server.on('connect_error', () => console.log('connect error'));

        server.on('disconnect', () => console.log('disconnect'));

        return () => {
            server.off('connect', () => console.log('connect'));
            server.off('connect_error', () => console.log('connect error'));

            server.off('disconnect', () => console.log('disconnect'));
        };
    }, [server]);

    const finalValue = useMemo<IServerContext>(() => {
        return { server, controllers: { restart } };
    }, [server, restart]);

    return <ServerContext.Provider value={finalValue}>{children}</ServerContext.Provider>;
};

export default ServerContextProvider;
