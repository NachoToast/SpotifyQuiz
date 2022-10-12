import { Server, Socket } from 'socket.io';
import GameUser from '../../../shared/GameUser';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/SocketEvents';
import { getIpFromSocket } from '../helpers';

export interface GameProps {
    /** Server to attach this game's socket to. */
    io: Server<ClientToServerEvents, ServerToClientEvents>;
}

export default class Game {
    private static readonly _usernameValidation = new RegExp(/^([a-zA-Z0-9]| ){2,20}$/);

    private readonly _io: Server<ClientToServerEvents, ServerToClientEvents>;
    public readonly code = Game.makeGameCode();

    /** Map of players by (lowercased) name. */
    private readonly _players = new Map<string, GameUser>();

    public onClose?: (game: Game) => void;

    public get numPlayers() {
        return this._players.size;
    }

    public constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
        this._io = io;
    }

    /** Called when a new socket connection is made to this game's server. */
    public handleJoin(socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
        const username = Game.getUsernameFromSocket(socket);

        // 1. check they actually have a username
        if (username === null) {
            socket.emit('setNameFailed', 'missing');
            socket.disconnect();
            return;
        }

        // 2. check if their supplied username taken
        if (this._players.get(username.toLowerCase()) !== undefined) {
            socket.emit('setNameFailed', 'taken');
            socket.disconnect();
            return;
        }

        // 3. check username is syntactically valid
        if (username.length < 2) {
            socket.emit('setNameFailed', 'tooShort');
            socket.disconnect();
            return;
        }
        if (username.length > 20) {
            socket.emit('setNameFailed', 'tooLong');
            socket.disconnect();
            return;
        }
        if (!Game._usernameValidation.test(username)) {
            socket.emit('setNameFailed', 'invalidChars');
            socket.disconnect();
            return;
        }

        // now we can finally 'create' the player
        console.log(socket.handshake.auth.username, 'connected', `(${getIpFromSocket(socket)})`);
        const newPlayer: GameUser = { name: username, host: this._players.size === 0, points: 0 };
        socket.emit('welcomeToGame', [...this._players.values()]);
        this._io.to(this.code).emit('userJoined', newPlayer);
        socket.join(this.code);
        this._players.set(newPlayer.name.toLowerCase(), newPlayer);

        socket.once('disconnect', () => this.handleLeave(socket));
    }

    /** Called when an existing socket connection to this game's server is disconnected. */
    private handleLeave(socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
        if (this._players.size === 1) {
            // this player was the last one, so no need to do anything besides close the lobby
            this.shutdown();
            return;
        }

        const username = Game.getUsernameFromSocket(socket);
        if (username === null) return; // should never happen

        const player = this._players.get(username.toLowerCase());
        if (player === undefined) return; // should never happen

        console.log(socket.handshake.auth.username, `(${player.host})`, 'disconnected', `(${getIpFromSocket(socket)})`);

        if (player.host) {
            // this player was the host, so we also need to just shut down the lobby
            this.shutdown();
            return;
        }

        this._io.to(this.code).emit('userLeft', player);

        this._players.delete(username.toLowerCase());

        console.log(socket.handshake.auth.username, 'disconnected');
    }

    /**
     * Called after {@link handleLeave} if there are no {@link _players players} remaining,
     * or externally.
     */
    public shutdown(): void {
        this._io.to(this.code).disconnectSockets(true);
        this.onClose?.(this);
    }

    private static getUsernameFromSocket(s: Socket): string | null {
        if (typeof s.handshake.auth.username === 'string') {
            return s.handshake.auth.username.trim();
        }
        return null;
    }

    private static _numGeneratedCodes = 0;

    private static makeGameCode(): string {
        // time in MS prevents guessing game codes, despite being predictable (1/1000 chance to guess correctly)
        // 'z' divider prevents duplicates from concatenation (e.g. "A + FF" and "AF + F")
        // num generated codes prevents duplicates from same MS (e.g. both created at 111ms)
        return new Date().getMilliseconds().toString(16) + 'z' + (Game._numGeneratedCodes++).toString(16);
    }
}
