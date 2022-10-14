import { SpotifyImage, SpotifyTrack } from './Spotify';

/** Host needs to (re)select a playlist. */
export interface InitialGameState {
    state: 0;
}

/** Host has selected a playlist and the server is loading the tracks from it. */
export interface LoadingGameState {
    state: 1;
}

/** Host has selected a playlist, and needs to press the 'start game' button. */
export interface ReadyGameState {
    state: 2;
    trackNumber?: number;
}

/** Host has started the game and playback is ongoing. */
export interface ActiveGameState {
    state: 3;

    trackNumber: number;
    outOf: number;

    videoId: string;

    startAt: number;
    startedAt: string;

    windowSize: number;
}

/** Time for guessing has finished, temporary "cooldown" time until next state. */
export interface CooldownGameState extends Omit<ActiveGameState, 'state'> {
    state: 4;
    track: {
        title: string;
        artists: string[];
        thumbnail: string | undefined;
    };
}

export type GameStates = InitialGameState | ReadyGameState | LoadingGameState | ActiveGameState | CooldownGameState;
