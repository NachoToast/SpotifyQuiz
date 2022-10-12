import React, { ReactNode } from 'react';
import SettingsContextProvider from './Settings/SettingsProvider';
import SpotifyContextProvider from './Spotify/SpotifyProvider';

const ContextProviders = ({ children }: { children: ReactNode }) => {
    return (
        <SettingsContextProvider>
            <SpotifyContextProvider>{children}</SpotifyContextProvider>
        </SettingsContextProvider>
    );
};

export default ContextProviders;
