import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Settings from '../types/Settings';
import { defaultSettings, getLocalSettings, saveLocalSettings } from '../helpers/settingsHelpers';
import {
    ExtendedSpotifyToken,
    getLocalSpotifyAuth,
    saveLocalSpotifyAuth,
    sessionState,
} from '../helpers/SpotifyAuthHelpers';
import SpotifyToken from '../../../shared/SpotifyToken';

export interface MainState {
    settings: Settings;
    spotifyAuth: ExtendedSpotifyToken | null;
    refreshTimeout: NodeJS.Timeout | null;
}

const initialState: MainState = {
    settings: getLocalSettings(),
    spotifyAuth: getLocalSpotifyAuth(),
    refreshTimeout: null,
};

export const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setSettings(state, action: PayloadAction<Settings>) {
            state.settings = action.payload;
            saveLocalSettings(state.settings);
        },
        resetSettings(state, action: PayloadAction<keyof Settings>) {
            state.settings = { ...state.settings, [action.payload]: defaultSettings()[action.payload] };
            saveLocalSettings(state.settings);
        },
        setSpotifyOAuth(state, action: PayloadAction<SpotifyToken>) {
            state.spotifyAuth = { ...action.payload, setAt: Date.now() };
            saveLocalSpotifyAuth(state.spotifyAuth);
        },
    },
});

export const { setSettings, resetSettings, setSpotifyOAuth } = mainSlice.actions;

export const getSettings = (state: RootState) => state.main.settings;

export const getOAuthLink = (state: RootState) => {
    const params = new URLSearchParams([
        ['response_type', 'code'],
        ['client_id', state.main.settings.spotifyClientId],
        ['scope', 'playlist-read-private'],
        ['redirect_uri', state.main.settings.redirectURI],
        ['state', sessionState],
        ['show_dialog', 'true'],
    ]);

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export default mainSlice.reducer;
