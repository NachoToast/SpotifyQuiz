/* eslint-disable jsx-a11y/anchor-has-content */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import api from './api';
import AlertModal from './components/AlertModal';
import Home from './components/Pages/Home';
import Login from './components/Pages/Login';
import Multiplayer from './components/Pages/Multiplayer';
import NotFound from './components/Pages/NotFound';
import Settings from './components/Pages/Settings';
import Singleplayer from './components/Pages/Singleplayer';
import { getTimeTillExpiry } from './helpers/SpotifyAuthHelpers';
import {
    clearSpotifyOAuth,
    getLoggedInAs,
    getSettings,
    getSpotifyOAuth,
    setLoggedInAs,
    setRefreshedNotification,
    setSpotifyOAuth,
} from './redux/mainSlice';
import { AppDispatch } from './redux/store';

import githubIcon from './github.svg';
import settingsIcon from './settings.svg';

const App = () => {
    const dispatch = useDispatch<AppDispatch>();
    const settings = useSelector(getSettings);
    const loggedInAs = useSelector(getLoggedInAs);
    const spotifyOAuth = useSelector(getSpotifyOAuth);

    // check who we're logged in as on page load
    useEffect(() => {
        if (spotifyOAuth !== null && loggedInAs === null) {
            const controller = new AbortController();
            api.Spotify.getCurrentUserProfile(spotifyOAuth.access_token, controller)
                .then((e) => {
                    dispatch(setLoggedInAs(e));
                })
                .catch(console.error);

            return () => {
                controller.abort();
            };
        }
        return;
    }, [dispatch, loggedInAs, spotifyOAuth]);

    // schedule refresh when access token changes
    useEffect(() => {
        if (spotifyOAuth === null) return;

        const expiresIn = getTimeTillExpiry(spotifyOAuth);

        if (expiresIn < settings.minRefresh) {
            console.log(`[SpotifyAuth] Token expires too soon (${expiresIn} < ${settings.minRefresh} seconds)`);
            dispatch(clearSpotifyOAuth());
            return;
        }

        if (expiresIn <= settings.maxRefresh * 60) {
            console.log(
                `[SpotifyAuth] Token expires soon (${Math.floor(expiresIn / 60)} <= ${settings.maxRefresh} minutes)`,
            );
            const controller = new AbortController();

            api.refreshSpotifyAccessToken(settings.serverUrl, spotifyOAuth.refresh_token, {
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            }).then((e) => {
                if (e.success) {
                    dispatch(setSpotifyOAuth(e.data));
                    dispatch(setRefreshedNotification());
                } else {
                    console.log(e.error);
                    dispatch(clearSpotifyOAuth());
                }
            });

            return () => {
                controller.abort();
            };
        }

        const scheduledIn = expiresIn - settings.maxRefresh * 60;

        console.log(
            `[SpotifyAuth] Will attempt refresh in ${Math.floor(scheduledIn / 60)} minutes (${Math.floor(
                expiresIn / 60,
            )} > ${settings.maxRefresh} minutes)`,
        );

        const timeout = setTimeout(() => {
            api.refreshSpotifyAccessToken(settings.serverUrl, spotifyOAuth.refresh_token, {
                rateLimitBypassToken: settings.rateLimitBypassToken,
            }).then((e) => {
                if (e.success) {
                    dispatch(setSpotifyOAuth(e.data));
                    dispatch(setRefreshedNotification());
                } else {
                    console.log(e.error);
                    dispatch(clearSpotifyOAuth());
                }
            });
        }, expiresIn * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [
        dispatch,
        settings.maxRefresh,
        settings.minRefresh,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        spotifyOAuth,
    ]);

    return (
        <BrowserRouter>
            <AlertModal />
            <div id="optionBar">
                <a
                    href="https://github.com/NachoToast/SpotifyQuiz"
                    rel="noreferrer"
                    target="_blank"
                    id="githubButton"
                    style={{ backgroundImage: `url(${githubIcon})` }}
                    title="GitHub"
                />
                <Link
                    to="/settings"
                    id="settingsButton"
                    style={{ backgroundImage: `url(${settingsIcon})` }}
                    title="Settings"
                />
            </div>

            <Routes>
                <Route index element={<Home />} />
                <Route path="singleplayer" element={<Singleplayer />} />
                <Route path="multiplayer" element={<Multiplayer />} />
                <Route path="settings" element={<Settings />} />
                <Route path="login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
