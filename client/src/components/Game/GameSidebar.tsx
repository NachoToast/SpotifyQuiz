import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import GamePlayer from '../../../../shared/GamePlayer';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import './GameSidebar.css';

export interface UserSidebarProps {
    players: Map<string, GamePlayer>;
    username: string;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    gameCode: string;
}

const GameSidebar = ({ players, username, socket, gameCode }: UserSidebarProps) => {
    const sortedPlayers = useMemo(() => Array.from(players.values()).sort((a, b) => b.points - a.points), [players]);

    const [copyStatus, setCopyStatus] = useState<boolean | null>(null);

    const handleQuit = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            socket.disconnect();
        },
        [socket],
    );

    const handleCopyCode = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            try {
                navigator.clipboard.writeText(`${window.location.origin}/#${gameCode}`);
                setCopyStatus(true);
            } catch (error) {
                setCopyStatus(false);
                window.alert(`Unable to copy, here is the game code to manually do it: ${gameCode}`);
            }
        },
        [gameCode],
    );

    useEffect(() => {
        if (copyStatus === null) return;

        const timeout = setTimeout(() => setCopyStatus(null), 1_000);

        return () => {
            clearTimeout(timeout);
        };
    }, [copyStatus]);

    return (
        <div className="gameSidebar">
            <div className="gamePlayers">
                <h3>Players ({players.size})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map(({ name, points, host, state }) => (
                            <tr
                                key={name}
                                title={
                                    name === username && host
                                        ? 'You (host)'
                                        : name === username
                                        ? 'You'
                                        : host
                                        ? 'Host'
                                        : undefined
                                }
                                style={{ position: 'relative' }}
                            >
                                <td style={{ color: name === username ? 'gold' : undefined }}>
                                    {host && '👑'}
                                    {name}
                                </td>
                                <td>{points}</td>
                                {
                                    <td
                                        className={`playerSpeechBubble ${
                                            ['idle', 'guessing', 'guessed', 'wrong', 'correct'][state.state]
                                        }`}
                                    >
                                        <span>
                                            {state.state === 1
                                                ? '🤔'
                                                : state.state === 4
                                                ? '✅'
                                                : state.state === 3
                                                ? `${state.guess !== '' ? ` ${state.guess}` : ''}❌`
                                                : '😎'}
                                        </span>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="gameButtons">
                <button className="copyCodeButton" onClick={handleCopyCode}>
                    {copyStatus === null ? 'Copy Code' : copyStatus ? 'Copied!' : 'Error'}
                </button>
                <div />
                <button className="quitGameButton" onClick={handleQuit} title={undefined}>
                    Quit Game
                </button>
            </div>
        </div>
    );
};

export default GameSidebar;
