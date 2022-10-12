import { createContext } from 'react';
import { defaultSettingsContext } from './settingsDefaults';

export * from './SettingsTypes';
export * from './settingsDefaults';

export const SettingsContext = createContext(defaultSettingsContext);
