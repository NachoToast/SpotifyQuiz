import { useEffect, useMemo, useState } from 'react';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import { Socket } from 'socket.io-client';
import './Game.css';
import Chatbox from './Chatbox';
import GameSidebar from './GameSidebar';
import SongArea from './SongArea';
import { GameStates } from '../../../../shared/GameStates';
import GamePlayer from '../../../../shared/GamePlayer';

export interface GameProps {
    gameState: GameStates;
    gameCode: string;
    username: string;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    players: GamePlayer[];
}

const Game = ({ gameCode, username, socket, gameState: initialGameState, players: initialPlayers }: GameProps) => {
    const [gameState, setGameState] = useState<GameStates>(initialGameState);

    const [players, setPlayers] = useState(
        new Map<string, GamePlayer>([
            ...initialPlayers.map((e) => [e.name, e] as [string, GamePlayer]),
            [
                username,
                {
                    name: username,
                    host: initialPlayers.length === 0,
                    points: 0,
                    state: { state: 0 },
                },
            ],
        ]),
    );

    const me = useMemo(() => players.get(username)!, [players, username]);

    useEffect(() => {
        const handleStateUpdate = (...newPlayerStates: GamePlayer[]) => {
            newPlayerStates.forEach((player) => {
                players.set(player.name, player);
            });
            setPlayers(new Map<string, GamePlayer>(Array.from(players.values()).map((e) => [e.name, e])));
        };

        socket.on('playerStateUpdate', handleStateUpdate);
        socket.on('bulkPlayerStateUpdated', (e) => handleStateUpdate(...e));

        return () => {
            socket.off('playerStateUpdate', handleStateUpdate);
            socket.off('bulkPlayerStateUpdated', (e) => handleStateUpdate(...e));
        };
    }, [players, socket]);

    useEffect(() => {
        socket.on('gameStateUpdate', setGameState);

        return () => {
            socket.off('gameStateUpdate', setGameState);
        };
    }, [socket]);

    useEffect(() => {
        const handleJoin = (e: GamePlayer) => {
            players.set(e.name, e);
            setPlayers(new Map<string, GamePlayer>(Array.from(players.values()).map((e) => [e.name, e])));
        };

        const handleLeave = (e: GamePlayer) => {
            players.delete(e.name);
            setPlayers(new Map<string, GamePlayer>(Array.from(players.values()).map((e) => [e.name, e])));
        };

        socket.on('playerJoined', handleJoin);
        socket.on('playerLeft', handleLeave);

        return () => {
            socket.off('playerJoined', handleJoin);
            socket.off('playerLeft', handleLeave);
        };
    }, [players, socket]);

    useEffect(() => {
        if (window.location.hash.slice(1) !== '') {
            window.location.hash = '';
        }
    }, []);

    return (
        <div className="gameContainer">
            <div className="mainContent">
                <SongArea socket={socket} gameState={gameState} me={me} />
                <Chatbox socket={socket} />
            </div>
            <GameSidebar players={players} username={username} socket={socket} gameCode={gameCode} />
        </div>
    );
};

export default Game;
