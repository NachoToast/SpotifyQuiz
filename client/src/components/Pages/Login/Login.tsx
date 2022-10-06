import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sessionState } from '../../../helpers/SpotifyAuthHelpers';
import { getOAuthLink, getSettings, setSpotifyOAuth } from '../../../redux/mainSlice';
import ExternalLink from '../../Links/ExternalLink';
import InternalLink from '../../Links/InternalLink';
import axios from 'axios';
import { AppDispatch } from '../../../redux/store';
import SpotifyToken from '../../../../../shared/SpotifyToken';

enum LoginStatuses {
    /** Initial status. */
    Loading,

    /** Received "error=access_denied" from Spotify, meaning user pressed cancel. */
    AccessDenied,

    /** Received "error=<something else>" from Spotify.  */
    UnknownError,

    /** Missing code or state from query. */
    InvalidQuery,

    /** Received query state doesn't match session state, possible CSRF. */
    InvalidState,

    /** Sent upgrade to access token request to serverURL/auth. */
    WaitingForServer,

    /** Received a non-axios error from the server. */
    UnknownError2,

    /** Received an expected error from the server. */
    KnownError,

    Success,
}

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authLink = useSelector(getOAuthLink);
    const settings = useSelector(getSettings);

    const [loginStatus, setLoginStatus] = useState(LoginStatuses.Loading);
    const [additionalContext, setAdditionalContext] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const error = params.get('error');
        const code = params.get('code');
        const state = params.get('state');

        if (error !== null) {
            if (error === 'access_denied') {
                setLoginStatus(LoginStatuses.AccessDenied);
            } else {
                setLoginStatus(LoginStatuses.UnknownError);
                setAdditionalContext(error);
            }
            return;
        }

        if (code === null || state === null) {
            setLoginStatus(LoginStatuses.InvalidQuery);
            return;
        }

        if (state !== sessionState) {
            setLoginStatus(LoginStatuses.InvalidState);
            return;
        }

        setLoginStatus(LoginStatuses.WaitingForServer);

        const controller = new AbortController();

        axios
            .get<SpotifyToken>(`${settings.serverUrl}/auth?code=${code}`)
            .then(({ data }) => {
                dispatch(setSpotifyOAuth(data));
                setLoginStatus(LoginStatuses.Success);
                window.location.href = '/';
            })
            .catch((e) => {
                if (axios.isAxiosError(e)) {
                    if (typeof e.response?.data.message === 'string') {
                        setLoginStatus(LoginStatuses.KnownError);
                        setAdditionalContext(e.response.data.message);
                    } else if (typeof e.response?.data.error_description === 'string') {
                        setLoginStatus(LoginStatuses.KnownError);
                        setAdditionalContext(e.response.data.error_description);
                    } else if (e.code === 'ERR_NETWORK' || e.response?.status === 404) {
                        setLoginStatus(LoginStatuses.KnownError);
                        setAdditionalContext('Network error, the server might be down :(');
                    } else if (e.response?.status === 429) {
                        setLoginStatus(LoginStatuses.KnownError);
                        setAdditionalContext('Rate limited, please wait before trying again');
                    } else {
                        setLoginStatus(LoginStatuses.UnknownError2);
                        setAdditionalContext(`${e.code}: ${e.message}`);
                    }
                } else {
                    setLoginStatus(LoginStatuses.UnknownError2);
                    setAdditionalContext(`${e}`);
                    console.log(e);
                }
            });

        return () => {
            controller.abort();
        };
    }, [dispatch, settings.serverUrl]);

    switch (loginStatus) {
        case LoginStatuses.Loading:
            return (
                <div>
                    <h1>Loading</h1>
                    <p style={{ textAlign: 'center', color: 'gray' }}>Deciding what to do...</p>
                </div>
            );
        case LoginStatuses.AccessDenied:
            return (
                <div>
                    <h1>Access Denied</h1>
                    <p style={{ textAlign: 'center', color: 'lightcoral' }}>You clicked cancel</p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Try Again</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.UnknownError:
            return (
                <div>
                    <h1>Unknown Error</h1>
                    <p style={{ textAlign: 'center', color: 'lightcoral' }}>
                        We received an unknown response from Spotify:
                        <br />
                        {additionalContext}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Try Again</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.InvalidQuery:
            return (
                <div>
                    <h1>Invalid Query</h1>
                    <p style={{ textAlign: 'center', color: 'gray' }}>
                        You don't seem to have come here via Spotify &gt;:(
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Login to Spotify</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.InvalidState:
            return (
                <div>
                    <h1>Security Error</h1>
                    <p style={{ textAlign: 'center', color: 'lightcoral' }}>
                        It seems someone tried to intercept your request
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Try Again</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.WaitingForServer:
            return (
                <div>
                    <h1>Finishing Login</h1>
                    <p style={{ textAlign: 'center', color: 'gray' }}>Awaiting server response...</p>
                </div>
            );
        case LoginStatuses.UnknownError2:
            return (
                <div>
                    <h1>Unknown Error</h1>
                    <p style={{ textAlign: 'center', color: 'lightcoral' }}>
                        Occurred while trying to fetch server response:
                        <br />
                        {additionalContext}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Try Again</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.KnownError:
            return (
                <div>
                    <h1>Error</h1>
                    <p style={{ textAlign: 'center', color: 'lightcoral' }}>{additionalContext}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <ExternalLink href={authLink}>Try Again</ExternalLink>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
        case LoginStatuses.Success:
            return (
                <div>
                    <h1>Logged In</h1>
                    <p style={{ textAlign: 'center', color: 'lightgreen' }}>Success!</p>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <InternalLink href="/">Home</InternalLink>
                    </div>
                </div>
            );
    }
};

export default Login;
