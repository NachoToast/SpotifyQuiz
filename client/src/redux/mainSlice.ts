import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import Settings from '../types/Settings';
import { defaultSettings, getLocalSettings, saveLocalSettings } from '../helpers/settingsHelpers';
import {
    clearLocalSpotifyAuth,
    ExtendedSpotifyToken,
    getLocalSpotifyAuth,
    saveLocalSpotifyAuth,
    sessionState,
} from '../helpers/SpotifyAuthHelpers';
import SpotifyUser from '../../../shared/Spotify/SpotifyUser';
import { clearLocalSpotifyUser, getLocalSpotifyUser, saveLocalSpotifyUser } from '../helpers/SpotifyUserHelpers';

export interface MainState {
    settings: Settings;
    spotifyAuth: ExtendedSpotifyToken | null;
    loggedInAs: SpotifyUser | null;
    notification: ['loggedIn', SpotifyUser] | 'loggedOut' | 'refreshed' | null;
}

const initialState: MainState = {
    settings: getLocalSettings(),
    spotifyAuth: getLocalSpotifyAuth(),
    loggedInAs: getLocalSpotifyUser(),
    notification: null,
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
        setSpotifyOAuth(state, action: PayloadAction<ExtendedSpotifyToken>) {
            state.spotifyAuth = action.payload;
            saveLocalSpotifyAuth(state.spotifyAuth);
        },
        clearSpotifyOAuth(state) {
            state.spotifyAuth = null;
            state.loggedInAs = null;
            state.notification = 'loggedOut';
            clearLocalSpotifyAuth();
            clearLocalSpotifyUser();
        },
        setLoggedInAs(state, action: PayloadAction<SpotifyUser>) {
            state.loggedInAs = action.payload;
            state.notification = ['loggedIn', action.payload];
            saveLocalSpotifyUser(state.loggedInAs);
        },
        setRefreshedNotification(state) {
            state.notification = 'refreshed';
        },
        clearNotification(state) {
            state.notification = null;
        },
    },
});

export const {
    setSettings,
    resetSettings,
    setSpotifyOAuth,
    clearSpotifyOAuth,
    setLoggedInAs,
    clearNotification,
    setRefreshedNotification,
} = mainSlice.actions;

export const getSettings = (state: RootState) => state.main.settings;

export const getSpotifyOAuth = (state: RootState) => state.main.spotifyAuth;

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

export const getLoggedInAs = (state: RootState) => state.main.loggedInAs;

export const getNotification = (state: RootState) => state.main.notification;

export default mainSlice.reducer;
