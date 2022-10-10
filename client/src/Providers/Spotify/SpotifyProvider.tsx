import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ServerContext, SettingsContext } from '../../Contexts';
import { ISpotifyContext, Spotify, SpotifyContext, SpotifyControllers } from '../../Contexts/Spotify';
import { SpotifyEvents } from '../../Contexts/Spotify/Spotify';
import { TypedEmitter } from 'tiny-typed-emitter';

import {
    getAllCurrentUserPlaylists,
    getCurrentUserProfile,
    getLocalSpotify,
    getSecondsTillExpiry,
    saveLocalSpotify,
} from './SpotifyHelpers';

const events = new TypedEmitter<SpotifyEvents>();

const SpotifyContextProvider = ({ children }: { children: ReactNode }) => {
    const [spotify, setSpotify] = useState<Spotify | null>(getLocalSpotify);

    const { settings } = useContext(SettingsContext);
    const { server } = useContext(ServerContext);

    useEffect(() => saveLocalSpotify(spotify), [spotify]);

    const requestLogin = useCallback<SpotifyControllers['requestLogin']>(
        (authorizationCode, redirectUri) => {
            return new Promise((resolve) => {
                server.once('spotifyLoginComplete', (e) => {
                    if (e.success) {
                        setSpotify({
                            authData: { ...e.data, setAt: new Date().toISOString() },
                            user: null,
                            playlists: null,
                        });
                        resolve(true);
                    } else {
                        console.log('[SpotifyProvider] requestLogin error');
                        console.error(e);
                        resolve(e.error);
                    }
                });

                server.emit('spotifyLogin', authorizationCode, redirectUri);
            });
        },
        [server],
    );

    const requestRefresh = useCallback<SpotifyControllers['requestRefresh']>(
        (currentData) => {
            return new Promise((resolve) => {
                server.once('spotifyRefreshComplete', (e) => {
                    if (e.success) {
                        setSpotify({
                            ...currentData,
                            authData: {
                                ...e.data,
                                setAt: new Date().toISOString(),
                                refresh_token: e.data.refresh_token ?? currentData.authData.refresh_token,
                            },
                        });
                        events.emit('refreshed');
                        resolve(true);
                    } else {
                        setSpotify(null);
                        console.log('[SpotifyProvider] request refresh error');
                        console.error(e);
                        resolve(e.error);
                    }
                });

                server.emit('spotifyRefresh', currentData.authData.refresh_token);
            });
        },
        [server],
    );

    const logout = useCallback<SpotifyControllers['logout']>(() => {
        setSpotify(null);
        events.emit('loggedOut');
    }, []);

    // scheduling refresh requests
    useEffect(() => {
        if (spotify === null) return;

        const secondsTillExpiry = getSecondsTillExpiry(spotify);

        if (Number.isNaN(secondsTillExpiry) || secondsTillExpiry < settings.minRefresh) {
            console.log(
                `[Spotify] Token expires too soon (in ${secondsTillExpiry} seconds, lowest acceptable is ${settings.minRefresh} seconds)`,
            );
            setSpotify(null);
            return;
        }

        const minsTillExpiry = Math.floor(secondsTillExpiry / 60);

        if (minsTillExpiry <= settings.maxRefresh) {
            console.log(
                `[Spotify] Token expires in ${minsTillExpiry} minutes, below the ${settings.maxRefresh} minute threshold; attempting refresh...`,
            );
            requestRefresh(spotify);
            return;
        }

        const scheduledInMinutes = minsTillExpiry - settings.maxRefresh;

        console.log(
            `[Spotify] Token expires in ${minsTillExpiry} minutes, will attempt refresh in ${scheduledInMinutes} minutes`,
        );

        const timeout = setTimeout(() => requestRefresh(spotify), scheduledInMinutes * 1000 * 60);

        return () => {
            clearTimeout(timeout);
        };
    }, [requestRefresh, server, settings.maxRefresh, settings.minRefresh, spotify]);

    useEffect(() => {
        if (spotify === null || spotify.user !== null) return;

        const controller = new AbortController();

        getCurrentUserProfile(spotify.authData.access_token, controller)
            .then((user) => {
                setSpotify({ ...spotify, user });
            })
            .catch((e) => {
                console.log('[SpotifyProvider] getCurrentUserProfile error');
                console.error(e);
            });

        return () => {
            controller.abort();
        };
    }, [spotify]);

    useEffect(() => {
        if (spotify === null || spotify.playlists !== null) return;

        const controller = new AbortController();

        getAllCurrentUserPlaylists(spotify.authData.access_token, controller)
            .then((playlists) => {
                setSpotify({ ...spotify, playlists });
            })
            .catch((e) => {
                console.log('[SpotifyProvider] getCurrentUserPlaylists error');
                console.error(e);
            });

        return () => {
            controller.abort();
        };
    }, [spotify]);

    const finalValue = useMemo<ISpotifyContext>(() => {
        return { spotify, controllers: { requestLogin, requestRefresh, logout }, events };
    }, [logout, requestLogin, requestRefresh, spotify]);

    return <SpotifyContext.Provider value={finalValue}>{children}</SpotifyContext.Provider>;
};

export default SpotifyContextProvider;
