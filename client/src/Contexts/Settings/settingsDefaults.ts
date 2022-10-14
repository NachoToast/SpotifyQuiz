import { Settings, ISettingsContext, SettingsControllers, SettingsSessionData } from './SettingsTypes';

export const defaultSettings: Settings = {
    serverUrl:
        window.location.host === 'localhost:3000'
            ? 'http://localhost:3001'
            : window.location.host === 'ntgc.ddns.net:3000'
            ? 'http://ntgc.ddns.net:3001'
            : 'https://spq.nachotoast.com',
    rateLimitBypassToken: '',
    spotifyClientId: '7fa87b67fc974969abb02a43bc7d0f60',
    redirectUri: window.location.origin + '/login',
    minRefresh: 30,
    maxRefresh: 30,
};

export const defaultSettingsControllers: SettingsControllers = {
    setValue: function <T extends keyof Settings>(key: T, value: Settings[T]): void {
        throw new Error('Function not implemented.');
    },
    resetValue: function <T extends keyof Settings>(key: T): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultSettingsSessionData: SettingsSessionData = {
    state: '',
    oAuthLink: '',
};

export const defaultSettingsContext: ISettingsContext = {
    settings: defaultSettings,
    controllers: defaultSettingsControllers,
    sessionData: defaultSettingsSessionData,
};
