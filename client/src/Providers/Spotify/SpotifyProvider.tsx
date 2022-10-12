import { ReactNode, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { TypedEmitter } from 'tiny-typed-emitter';
import { api } from '../../api';
import { SettingsContext, SpotifyContext } from '../../Contexts';
import { SpotifyEvents, Spotify, SpotifyControllers, ISpotifyContext } from '../../Contexts/Spotify';
import {
    getLocalSpotify,
    saveLocalSpotify,
    getSecondsTillExpiry,
    getCurrentUserProfile,
    getAllCurrentUserPlaylists,
} from './SpotifyHelpers';

const events = new TypedEmitter<SpotifyEvents>();

const SpotifyContextProvider = ({ children }: { children: ReactNode }) => {
    const [authData, setAuthData] = useState<Spotify['authData'] | null>(getLocalSpotify('authData'));
    const [userData, setUserData] = useState<Spotify['userData']>(getLocalSpotify('userData'));
    const [playlists, setPlaylists] = useState<Spotify['playlists']>(null);

    const { settings } = useContext(SettingsContext);

    useEffect(() => saveLocalSpotify('authData', authData), [authData]);
    useEffect(() => saveLocalSpotify('userData', userData), [userData]);

    const logout = useCallback<SpotifyControllers['logout']>(() => {
        setAuthData(null);
        setUserData(null);
        setPlaylists(null);
        events.emit('loggedOut');
    }, []);

    const requestLogin = useCallback<SpotifyControllers['requestLogin']>(
        (authorizationCode, redirectUri) => {
            return new Promise((resolve) => {
                api.requestSpotifyAccessToken(
                    settings.serverUrl,
                    authorizationCode,
                    redirectUri,
                    settings.rateLimitBypassToken,
                ).then((e) => {
                    if (e.success) {
                        setAuthData({ ...e.data, setAt: new Date().toISOString() });
                        resolve(true);
                    } else {
                        logout();
                        console.log('[SpotifyProvider] requestLogin error');
                        console.error(e);
                        resolve(e.error);
                    }
                });
            });
        },
        [logout, settings.rateLimitBypassToken, settings.serverUrl],
    );

    const requestRefresh = useCallback<SpotifyControllers['requestRefresh']>(
        (currentData) => {
            return new Promise((resolve) => {
                api.refreshSpotifyAccessToken(
                    settings.serverUrl,
                    currentData.refresh_token,
                    settings.rateLimitBypassToken,
                ).then((e) => {
                    if (e.success) {
                        setAuthData({
                            ...e.data,
                            setAt: new Date().toISOString(),
                            refresh_token: e.data.refresh_token ?? currentData.refresh_token,
                        });
                        events.emit('refreshed');
                        resolve(true);
                    } else {
                        logout();
                        console.log('[SpotifyProvider] request refresh error');
                        console.error(e);
                        resolve(e.error);
                    }
                });
            });
        },
        [logout, settings.rateLimitBypassToken, settings.serverUrl],
    );

    // scheduling refresh requests
    useEffect(() => {
        if (authData === null) return;

        const secondsTillExpiry = getSecondsTillExpiry(authData);

        if (Number.isNaN(secondsTillExpiry) || secondsTillExpiry < settings.minRefresh) {
            console.log(
                `[Spotify] Token expires too soon (in ${secondsTillExpiry} seconds, lowest acceptable is ${settings.minRefresh} seconds)`,
            );
            logout();
            return;
        }

        const minsTillExpiry = Math.floor(secondsTillExpiry / 60);

        if (minsTillExpiry <= settings.maxRefresh) {
            console.log(
                `[Spotify] Token expires in ${minsTillExpiry} minutes, below the ${settings.maxRefresh} minute threshold; attempting refresh...`,
            );
            requestRefresh(authData);
            return;
        }

        const scheduledInMinutes = minsTillExpiry - settings.maxRefresh;

        console.log(
            `[Spotify] Token expires in ${minsTillExpiry} minutes, will attempt refresh in ${scheduledInMinutes} minutes`,
        );

        const timeout = setTimeout(() => requestRefresh(authData), scheduledInMinutes * 1000 * 60);

        return () => {
            clearTimeout(timeout);
        };
    }, [authData, logout, requestRefresh, settings.maxRefresh, settings.minRefresh]);

    useEffect(() => {
        if (authData === null || userData !== null) return;

        const controller = new AbortController();

        getCurrentUserProfile(authData.access_token, controller)
            .then((user) => {
                setUserData(user);
                events.emit('loggedIn', user);
            })
            .catch((e) => {
                if (!(e instanceof Error) || e.name !== 'CanceledError') {
                    console.error('[SpotifyProvider] getCurrentUserProfile error', e);
                }
            });

        return () => {
            controller.abort();
        };
    }, [authData, userData]);

    useEffect(() => {
        if (authData === null || playlists !== null) return;

        const controller = new AbortController();

        getAllCurrentUserPlaylists(authData.access_token, controller)
            .then((playlists) => {
                setPlaylists(playlists);
            })
            .catch((e) => {
                if (!(e instanceof Error) || e.name !== 'CanceledError') {
                    console.error('[SpotifyProvider] getCurrentUserPlaylists error', e);
                }
            });

        return () => {
            controller.abort();
        };
    }, [authData, playlists]);

    const finalSpotify = useMemo<ISpotifyContext['spotify']>(() => {
        if (authData !== null) {
            return {
                authData,
                userData,
                playlists,
            };
        }
        return null;
    }, [authData, playlists, userData]);

    const finalValue = useMemo<ISpotifyContext>(() => {
        return { spotify: finalSpotify, controllers: { requestLogin, requestRefresh, logout }, events };
    }, [finalSpotify, logout, requestLogin, requestRefresh]);

    return <SpotifyContext.Provider value={finalValue}>{children}</SpotifyContext.Provider>;
};

export default SpotifyContextProvider;
