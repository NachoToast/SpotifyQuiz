import { createContext } from 'react';
import { defaultSpotifyContext } from './spotifyDefaults';

export type { Spotify, SpotifyControllers, ISpotifyContext } from './Spotify';
export * from './spotifyDefaults';

export const SpotifyContext = createContext(defaultSpotifyContext);
