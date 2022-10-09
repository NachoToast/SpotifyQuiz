import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
    defaultSettings,
    ISettingsContext,
    Settings,
    SettingsContext,
    SettingsControllers,
} from '../../Contexts/Settings';
import { generateSessionData, getLocalSettings, saveLocalSettings } from './SettingsHelpers';

const SettingsContextProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(getLocalSettings);
    const sessionData = useMemo(() => generateSessionData(settings), [settings]);

    useEffect(() => saveLocalSettings(settings), [settings]);

    const setValue = useCallback<SettingsControllers['setValue']>(
        (k, v) => setSettings({ ...settings, [k]: v }),
        [settings],
    );

    const resetValue = useCallback<SettingsControllers['resetValue']>(
        (k) => setSettings({ ...settings, [k]: defaultSettings[k] }),
        [settings],
    );

    const finalValue = useMemo<ISettingsContext>(() => {
        return { settings, controllers: { setValue, resetValue }, sessionData };
    }, [resetValue, sessionData, setValue, settings]);

    return <SettingsContext.Provider value={finalValue}>{children}</SettingsContext.Provider>;
};

export default SettingsContextProvider;
