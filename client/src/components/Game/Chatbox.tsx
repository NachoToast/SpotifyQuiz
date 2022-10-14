import React, { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import GamePlayer from '../../../../shared/GamePlayer';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import './Chatbox.css';

export interface ChatboxProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

interface ChatMessage {
    from: GamePlayer | null;
    message: string;
    color: string | undefined;
}

const Chatbox = ({ socket }: ChatboxProps) => {
    const [receivedMessages, setReceivedMessages] = useState<ChatMessage[]>([]);

    const [outgoingMessage, setOutgoingMessage] = useState<string>('');

    const addMessage = useCallback(
        (from: GamePlayer | null, message: string, color: string | undefined) => {
            setReceivedMessages([{ from, message, color }, ...receivedMessages.slice(0, 29)]);
        },
        [receivedMessages],
    );

    const handlePlayerJoin = useCallback(
        (user: GamePlayer) => {
            addMessage(null, `${user.name} joined the game`, 'yellow');
        },
        [addMessage],
    );

    const handlePlayerLeave = useCallback(
        (user: GamePlayer) => {
            addMessage(null, `${user.name} left the game`, 'yellow');
        },
        [addMessage],
    );

    const sendChatMessage = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            socket.emit('chatMessage', outgoingMessage);
            setOutgoingMessage('');
        },
        [outgoingMessage, socket],
    );

    useEffect(() => {
        socket.on('chatMessage', addMessage);
        socket.on('playerJoined', handlePlayerJoin);
        socket.on('playerLeft', handlePlayerLeave);

        return () => {
            socket.off('chatMessage', addMessage);
            socket.off('playerJoined', handlePlayerJoin);
            socket.off('playerLeft', handlePlayerLeave);
        };
    }, [addMessage, handlePlayerJoin, handlePlayerLeave, socket]);

    return (
        <div className="chatbox">
            <div className="chatMessages">
                {receivedMessages.map(({ message, color, from }, i) => (
                    <p key={i} style={{ color }}>
                        {from !== null && `[${from.name}] `}
                        {message}
                    </p>
                ))}
            </div>
            <form className="chatInput" onSubmit={sendChatMessage}>
                <input
                    type="text"
                    placeholder="Chat"
                    value={outgoingMessage}
                    onChange={(e) => {
                        e.preventDefault();
                        setOutgoingMessage(e.target.value);
                    }}
                />
                <input type="submit" value="🗨️" />
            </form>
        </div>
    );
};

export default Chatbox;
