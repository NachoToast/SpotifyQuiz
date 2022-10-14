/** Player has not guessed anything yet, */
export interface IdlePlayerState {
    state: 0;
}

/** Player is typing out their guess. */
export interface GuessingPlayerState {
    state: 1;
}

/** Player has submitted their guess. */
export interface GuessedPlayerState {
    state: 2;
    guess: string;
}

/** Emitted by server only, player was incorrect. */
export interface WrongPlayerState {
    state: 3;
    guess: string;
}

/** Emitted by server only, player was correct. */
export interface CorrectPlayerState {
    state: 4;
}

export type PlayerStates = IdlePlayerState | GuessingPlayerState | GuessedPlayerState | WrongPlayerState | CorrectPlayerState;
