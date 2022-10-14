import { SpotifyLoginToken, SpotifyRefreshToken } from './SpotifyTokens';
import GamePlayer from './GamePlayer';
import GameSettings from './GameSettings';
import { GuessedPlayerState, GuessingPlayerState, IdlePlayerState, PlayerStates } from './PlayerStates';
import { GameStates } from './GameStates';

export interface ServerToClientEvents {
    setNameFailed: (reason: 'missing' | 'taken' | 'tooShort' | 'tooLong' | 'invalidChars') => void;

    welcomeToGame: (initialGameState: GameStates, initialPlayers: GamePlayer[]) => void;
    playerJoined: (player: GamePlayer) => void;
    playerLeft: (player: GamePlayer) => void;
    chatMessage: (from: GamePlayer | null, message: string, color: string | undefined) => void;

    playerStateUpdate: (player: GamePlayer) => void;
    bulkPlayerStateUpdated: (players: GamePlayer[]) => void;

    gameStateUpdate: (newState: GameStates) => void;
}

export interface ClientToServerEvents {
    chatMessage: (message: string) => void;
    guessStateUpdate: (newState: IdlePlayerState | GuessingPlayerState | GuessedPlayerState) => void;

    // host-specific
    playlistSelected: (playlistId: string, accessToken: string) => void;
    startGame: () => void;
}
