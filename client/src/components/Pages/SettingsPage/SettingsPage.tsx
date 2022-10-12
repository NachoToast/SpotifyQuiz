import React, { useCallback, useContext } from 'react';
import { SettingsContext, SpotifyContext } from '../../../Contexts';
import { defaultSettings, Settings as ISettings } from '../../../Contexts/Settings';
import { getSecondsTillExpiry } from '../../../Providers/Spotify/SpotifyHelpers';
import ExternalLink from '../../Links/ExternalLink';
import InternalLink from '../../Links/InternalLink';
import './SettingsPage.css';

const SettingsItem = ({
    label,
    value,
    handleChange,
    handleReset,
    isDefault,
    title,
    type,
}: {
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isDefault: boolean;
    title: string;
    type?: React.HTMLInputTypeAttribute;
}) => (
    <div className="settingsSection" title={title}>
        <label style={{ flexGrow: 1 }} htmlFor={label}>
            {label}
        </label>
        <input onChange={handleChange} className="settingsInput" type={type ?? 'text'} name={label} value={value} />
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
    const {
        settings,
        sessionData: { oAuthLink },
        controllers: settingsControllers,
    } = useContext(SettingsContext);
    const { spotify, controllers: spotifyControllers } = useContext(SpotifyContext);

    const handleTextChange = useCallback(
        (k: 'serverUrl' | 'rateLimitBypassToken' | 'spotifyClientId' | 'redirectUri') => {
            return (e: React.ChangeEvent<HTMLInputElement>) => {
                e.preventDefault();
                settingsControllers.setValue(k, e.target.value);
            };
        },
        [settingsControllers],
    );

    const handleNumberChange = useCallback(
        (k: 'minRefresh' | 'maxRefresh') => {
            return (e: React.ChangeEvent<HTMLInputElement>) => {
                e.preventDefault();
                if (Number.isNaN(e.target.valueAsNumber)) return;
                settingsControllers.setValue(k, e.target.valueAsNumber);
            };
        },
        [settingsControllers],
    );

    const handleReset = useCallback(
        (k: keyof ISettings) => {
            return (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                settingsControllers.resetValue(k);
            };
        },
        [settingsControllers],
    );

    return (
        <div style={{ width: 'min(90%, 1024px)' }}>
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
                value={settings.redirectUri}
                handleChange={handleTextChange('redirectUri')}
                handleReset={handleReset('redirectUri')}
                isDefault={defaultSettings.redirectUri === settings.redirectUri}
            />
            <SettingsItem
                title="Don't try to refresh tokens that expire in less than this many seconds"
                label="Min Refresh (Seconds)"
                value={settings.minRefresh.toString()}
                handleChange={handleNumberChange('minRefresh')}
                handleReset={handleReset('minRefresh')}
                isDefault={defaultSettings.minRefresh === settings.minRefresh}
                type="number"
            />
            <SettingsItem
                title="Try to refresh tokens that expire in this many minutes or less"
                label="Max Refresh (Minutes)"
                value={settings.maxRefresh.toString()}
                handleChange={handleNumberChange('maxRefresh')}
                handleReset={handleReset('maxRefresh')}
                isDefault={defaultSettings.maxRefresh === settings.maxRefresh}
                type="number"
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1em',
                }}
            >
                <InternalLink href="/">Home</InternalLink>
                {spotify !== null ? (
                    <div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                spotifyControllers.requestRefresh(spotify.authData);
                            }}
                            title={`Expires in ${Math.floor(getSecondsTillExpiry(spotify.authData) / 60)} minutes`}
                            className="internalLink"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                spotifyControllers.logout();
                            }}
                            title="Log out of current Spotify session"
                            className="internalLink warn"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <ExternalLink href={oAuthLink}>Login</ExternalLink>
                )}
            </div>
        </div>
    );
};

export default Settings;
