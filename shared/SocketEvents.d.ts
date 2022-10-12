import { SpotifyLoginToken, SpotifyRefreshToken } from './SpotifyTokens';
import GameUser from './GameUser';
import GameSettings from './GameSettings';

export interface ServerToClientEvents {
    setNameFailed: (reason: 'missing' | 'taken' | 'tooShort' | 'tooLong' | 'invalidChars') => void;
    welcomeToGame: (users: GameUser[]) => void;
    userJoined: (user: GameUser) => void;
    userLeft: (user: GameUser) => void;
    chatMessage: (from: string, message: string) => void;
}

export interface ClientToServerEvents {
    setName: (username: string) => void;
    chatMessage: (message: string) => void;
}
