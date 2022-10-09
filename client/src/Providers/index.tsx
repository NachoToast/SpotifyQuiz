import React, { ReactNode } from 'react';
import ServerContextProvider from './Server/ServerProvider';
import SettingsContextProvider from './Settings/SettingsProvider';
import SpotifyContextProvider from './Spotify/SpotifyProvider';

const ContextProviders = ({ children }: { children: ReactNode }) => {
    return (
        <SettingsContextProvider>
            <ServerContextProvider>
                <SpotifyContextProvider>{children}</SpotifyContextProvider>
            </ServerContextProvider>
        </SettingsContextProvider>
    );
};

export default ContextProviders;
