import { useCallback, useEffect, useMemo, useState } from 'react';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import { Socket } from 'socket.io-client';
import GameUser from '../../../../shared/GameUser';
import './Game.css';

export interface GameProps {
    gameCode: string;
    username: string;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    existingUsers: GameUser[];
}

const Game = ({ gameCode, username, socket, existingUsers }: GameProps) => {
    const [players, setPlayers] = useState<(GameUser & { isMe?: boolean })[]>([
        ...existingUsers,
        { name: username, host: existingUsers.every((e) => !e.host), points: 0, isMe: true },
    ]);
    const sortedPlayers = useMemo(() => players.sort((a, b) => a.points - b.points), [players]);

    const [copyStatus, setCopyStatus] = useState<boolean | null>(null);

    useEffect(() => {
        if (window.location.hash.slice(1) !== '') {
            window.location.hash = '';
        }
    }, []);

    useEffect(() => {
        const handleJoin = (e: GameUser) => {
            setPlayers([...players, e]);
        };
        const handleLeave = (e: GameUser) => {
            const newPlayers = [...players];
            const index = newPlayers.findIndex(({ name }) => name === e.name);
            if (index === -1) console.error(`index of ${e.name} is -1`);
            else {
                newPlayers.splice(index, 1);
                setPlayers(newPlayers);
            }
        };

        socket.on('userJoined', handleJoin);
        socket.on('userLeft', handleLeave);

        return () => {
            socket.off('userJoined', handleJoin);
            socket.off('userLeft', handleLeave);
        };
    }, [players, socket]);

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

    // <button
    //     onClick={handleLeave}
    //     className="quitGameButton"
    //     title={props.username === props.hostName ? 'This will close the lobby' : undefined}
    // >
    //     Quit Game
    // </button>

    return (
        <div className="gameContainer">
            <div className="mainContent">
                <div className="gameSong">current song</div>
                <div className="gameChat">chat</div>
            </div>
            <div className="gameSidebar">
                <div className="gamePlayers">
                    <h3>Players ({players.length})</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayers.map(({ name, points, isMe, host }) => (
                                <tr
                                    key={name}
                                    title={isMe && host ? 'You (host)' : isMe ? 'You' : host ? 'Host' : undefined}
                                >
                                    <td style={{ color: name === username ? 'gold' : undefined }}>
                                        {host && '👑'}
                                        {name}
                                    </td>
                                    <td>{points}</td>
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
        </div>
    );
};

export default Game;
