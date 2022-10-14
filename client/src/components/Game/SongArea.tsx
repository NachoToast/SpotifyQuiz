import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import GamePlayer from '../../../../shared/GamePlayer';
import { ActiveGameState, CooldownGameState, GameStates } from '../../../../shared/GameStates';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import { SettingsContext, SpotifyContext } from '../../Contexts';
import ExternalLink from '../Links/ExternalLink';
import PlaylistSelector from '../PlaylistSelector';
import ActiveSong from './ActiveSong';
import './SongArea.css';
import Timer from './Timer';

export interface SongAreaProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    gameState: GameStates;
    me: GamePlayer;
}

const SongArea = ({ socket, gameState, me }: SongAreaProps) => {
    const { spotify } = useContext(SpotifyContext);
    const {
        sessionData: { oAuthLink },
    } = useContext(SettingsContext);

    const [lastEmittedState, setLastEmittedState] = useState<number>(0);
    const [guess, setGuess] = useState('');

    const [pressedStart, setPressedStart] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setGuess('');
        if (gameState.state === 3) inputRef.current?.focus();
    }, [gameState]);

    useEffect(() => {
        setLastEmittedState(me.state.state);
    }, [me]);

    const handleSubmitGuess = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            if (lastEmittedState === 2) return;
            socket.emit('guessStateUpdate', { state: 2, guess });
            setLastEmittedState(2);
        },
        [guess, lastEmittedState, socket],
    );

    const handleChangeGuess = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            setGuess(e.target.value);
            if (e.target.value === '') {
                if (lastEmittedState === 0) return;
                socket.emit('guessStateUpdate', { state: 0 });
                setLastEmittedState(0);
            } else {
                if (lastEmittedState === 1) return;
                socket.emit('guessStateUpdate', { state: 1 });
                setLastEmittedState(1);
            }
        },
        [lastEmittedState, socket],
    );

    if (gameState.state <= 2) {
        if (!me.host) {
            return (
                <div className="songArea">
                    <p>Waiting for host to {gameState.state === 0 ? 'select a playlist' : 'start the game'}.</p>
                </div>
            );
        }
        if (spotify === null) {
            return (
                <div className="songArea">
                    <p style={{ color: 'lightcoral' }}>
                        You cannot select a playlist since you're not logged in to Spotify.
                    </p>
                    <ExternalLink href={oAuthLink}>Login to Spotify</ExternalLink>
                    <p style={{ color: 'gray', fontStyle: 'italic' }}>This will close the lobby.</p>
                </div>
            );
        }
        if (spotify.playlists === null) {
            return (
                <div className="songArea">
                    <p>Loading you Spotify playlists...</p>
                    <p style={{ color: 'gray', fontStyle: 'italic' }}>Please wait :)</p>
                </div>
            );
        }
        return (
            <div className="songArea">
                <PlaylistSelector
                    playlists={spotify.playlists}
                    disabled={gameState.state === 1 || pressedStart}
                    onSubmit={(playlistId) => {
                        socket.emit('playlistSelected', playlistId, spotify.authData.access_token);
                    }}
                />
                <input
                    type="submit"
                    value={
                        pressedStart ? 'Starting Game...' : gameState.state === 1 ? 'Loading Playlist...' : 'Start Game'
                    }
                    className="startGameButton"
                    disabled={gameState.state === 1 || pressedStart}
                    style={{ animationPlayState: gameState.state >= 1 ? 'running' : 'paused' }}
                    onClick={(e) => {
                        setPressedStart(true);
                        e.preventDefault();
                        socket.emit('startGame');
                    }}
                />
            </div>
        );
    }

    const aGameState = gameState as ActiveGameState | CooldownGameState;

    return (
        <div className="songArea active">
            <ActiveSong state={aGameState} me={me} />
            <form onSubmit={handleSubmitGuess} style={{ marginTop: '1em', display: 'flex' }}>
                <input ref={inputRef} onChange={handleChangeGuess} value={guess} type="text" placeholder="Guess Song" />
                <span
                    className={`guessOutput ${['idle', 'guessing', 'guessed', 'wrong', 'correct'][me.state.state]}`}
                />
            </form>
            <span className="songNumberInfo">
                Track {aGameState.trackNumber + 1} of {aGameState.outOf}
            </span>
            <Timer {...aGameState} />
        </div>
    );
};

export default SongArea;
