import { createContext } from 'react';
import { defaultSettingsContext } from './settingsDefaults';

export type { Settings, SettingsControllers, ISettingsContext } from './Settings';
export * from './settingsDefaults';

export const SettingsContext = createContext(defaultSettingsContext);
