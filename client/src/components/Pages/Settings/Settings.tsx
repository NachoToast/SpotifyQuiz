import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultSettings as getDefaultSettings } from '../../../helpers/settingsHelpers';
import { getSettings, resetSettings, setSettings } from '../../../redux/mainSlice';
import { AppDispatch } from '../../../redux/store';
import ISettings from '../../../types/Settings';
import InternalLink from '../../Links/InternalLink';
import './Settings.css';

const SettingsItem = ({
    label,
    value,
    handleChange,
    handleReset,
    isDefault,
}: {
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isDefault: boolean;
}) => (
    <div
        style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            margin: '0.3em 0',
        }}
    >
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
    const settings = useSelector(getSettings);

    const [defaultSettings] = useState(getDefaultSettings());

    const handleChange = useCallback(
        (k: keyof ISettings) => {
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
                label="Server URL"
                value={settings.serverUrl}
                handleChange={handleChange('serverUrl')}
                handleReset={handleReset('serverUrl')}
                isDefault={defaultSettings.serverUrl === settings.serverUrl}
            />
            <SettingsItem
                label="Rate Limit Bypass Token"
                value={settings.rateLimitBypassToken ?? ''}
                handleChange={handleChange('rateLimitBypassToken')}
                handleReset={handleReset('rateLimitBypassToken')}
                isDefault={defaultSettings.rateLimitBypassToken === settings.rateLimitBypassToken}
            />
            <SettingsItem
                label="Spotify Client ID"
                value={settings.spotifyClientId}
                handleChange={handleChange('spotifyClientId')}
                handleReset={handleReset('spotifyClientId')}
                isDefault={defaultSettings.spotifyClientId === settings.spotifyClientId}
            />
            <SettingsItem
                label="Redirect URI"
                value={settings.redirectURI}
                handleChange={handleChange('redirectURI')}
                handleReset={handleReset('redirectURI')}
                isDefault={defaultSettings.redirectURI === settings.redirectURI}
            />

            <InternalLink href="/">Home</InternalLink>
        </div>
    );
};

export default Settings;
