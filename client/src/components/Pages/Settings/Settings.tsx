import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultSettings as getDefaultSettings } from '../../../helpers/settingsHelpers';
import { getTimeTillExpiry } from '../../../helpers/SpotifyAuthHelpers';
import {
    clearSpotifyOAuth,
    getOAuthLink,
    getSettings,
    getSpotifyOAuth,
    resetSettings,
    setSettings,
    setSpotifyOAuth,
} from '../../../redux/mainSlice';
import { AppDispatch } from '../../../redux/store';
import ISettings from '../../../types/Settings';
import ExternalLink from '../../Links/ExternalLink';
import InternalLink from '../../Links/InternalLink';
import './Settings.css';

const SettingsItem = ({
    label,
    value,
    handleChange,
    handleReset,
    isDefault,
    title,
}: {
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isDefault: boolean;
    title: string;
}) => (
    <div className="settingsSection" title={title}>
        <label style={{ flexGrow: 1 }} htmlFor={label}>
            {label}
        </label>
        <input onChange={handleChange} className="settingsInput" name={label} value={value} />
        <button
            title="Reset to default"
            onClick={handleReset}
            className="settingsResetButton"
            style={{
                visibility: isDefault ? 'hidden' : 'visible',
            }}
        >
            🗑️
        </button>
    </div>
);

const Settings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authLink = useSelector(getOAuthLink);
    const settings = useSelector(getSettings);
    const spotifyOAuth = useSelector(getSpotifyOAuth);

    const [defaultSettings] = useState(getDefaultSettings());

    const handleTextChange = useCallback(
        (k: 'serverUrl' | 'rateLimitBypassToken' | 'spotifyClientId' | 'redirectURI') => {
            return (e: React.ChangeEvent<HTMLInputElement>) => {
                e.preventDefault();
                if (k === 'rateLimitBypassToken' && e.target.value === '') {
                    dispatch(setSettings({ ...settings, rateLimitBypassToken: null }));
                } else {
                    dispatch(setSettings({ ...settings, [k]: e.target.value }));
                }
            };
        },
        [dispatch, settings],
    );

    const handleNumberChange = useCallback(
        (k: 'minRefresh' | 'maxRefresh') => {
            return (e: React.ChangeEvent<HTMLInputElement>) => {
                e.preventDefault();
                dispatch(setSettings({ ...settings, [k]: Number(e.target.value) }));
            };
        },
        [dispatch, settings],
    );

    const handleReset = useCallback(
        (k: keyof ISettings) => {
            return (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                dispatch(resetSettings(k));
            };
        },
        [dispatch],
    );

    return (
        <div>
            <h1>Settings</h1>
            <SettingsItem
                title="Base endpoint for the Spotify Quiz server"
                label="Server URL"
                value={settings.serverUrl}
                handleChange={handleTextChange('serverUrl')}
                handleReset={handleReset('serverUrl')}
                isDefault={defaultSettings.serverUrl === settings.serverUrl}
            />
            <SettingsItem
                title="Put a bypass token for the Spotify Quiz server here if you have one"
                label="Rate Limit Bypass Token"
                value={settings.rateLimitBypassToken ?? ''}
                handleChange={handleTextChange('rateLimitBypassToken')}
                handleReset={handleReset('rateLimitBypassToken')}
                isDefault={defaultSettings.rateLimitBypassToken === settings.rateLimitBypassToken}
            />
            <SettingsItem
                title="Application ID from Spotify developer dashboard"
                label="Spotify Client ID"
                value={settings.spotifyClientId}
                handleChange={handleTextChange('spotifyClientId')}
                handleReset={handleReset('spotifyClientId')}
                isDefault={defaultSettings.spotifyClientId === settings.spotifyClientId}
            />
            <SettingsItem
                title="Redirect to here after logging in"
                label="Redirect URI"
                value={settings.redirectURI}
                handleChange={handleTextChange('redirectURI')}
                handleReset={handleReset('redirectURI')}
                isDefault={defaultSettings.redirectURI === settings.redirectURI}
            />
            <SettingsItem
                title="Don't try to refresh tokens that expire in less than this many seconds"
                label="Min Refresh (Seconds)"
                value={settings.minRefresh.toString()}
                handleChange={handleNumberChange('minRefresh')}
                handleReset={handleReset('minRefresh')}
                isDefault={defaultSettings.minRefresh === settings.minRefresh}
            />
            <SettingsItem
                title="Try to refresh tokens that expire in this many minutes or less"
                label="Max Refresh (Minutes)"
                value={settings.maxRefresh.toString()}
                handleChange={handleNumberChange('maxRefresh')}
                handleReset={handleReset('maxRefresh')}
                isDefault={defaultSettings.maxRefresh === settings.maxRefresh}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1em',
                }}
            >
                <InternalLink href="/">Home</InternalLink>
                {spotifyOAuth !== null ? (
                    <div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(
                                    setSpotifyOAuth({
                                        ...spotifyOAuth,
                                        expires_in: settings.maxRefresh * 60,
                                        setAt: Date.now(),
                                    }),
                                );
                            }}
                            title={`Expires in ${Math.floor(getTimeTillExpiry(spotifyOAuth) / 60)} minutes`}
                            className="internalLink"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(clearSpotifyOAuth());
                            }}
                            title="Log out of current Spotify session"
                            className="internalLink warn"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <ExternalLink href={authLink}>Login</ExternalLink>
                )}
            </div>
        </div>
    );
};

export default Settings;
