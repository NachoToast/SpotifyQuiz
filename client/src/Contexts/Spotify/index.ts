import { createContext } from 'react';
import { defaultSpotifyContext } from './spotifyDefaults';

export * from './SpotifyTypes';
export * from './spotifyDefaults';

export const SpotifyContext = createContext(defaultSpotifyContext);
