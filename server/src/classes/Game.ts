import { Server, Socket } from 'socket.io';
import { Video } from 'youtube-sr';
import GamePlayer from '../../../shared/GamePlayer';
import { CooldownGameState, GameStates, ActiveGameState, ReadyGameState } from '../../../shared/GameStates';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/SocketEvents';
import { SpotifyTrack } from '../../../shared/Spotify';
import { getAllPlaylistTracks } from '../helpers/getAllPlaylistTracks';
import trackToYouTubeVideo from '../helpers/trackToYouTubeVideo';

export interface GameProps {
    /** Server to attach this game's socket to. */
    io: Server<ClientToServerEvents, ServerToClientEvents>;
}

export default class Game {
    private static readonly _usernameValidation = new RegExp(/^([a-zA-Z0-9]| ){2,20}$/);

    private readonly _io: Server<ClientToServerEvents, ServerToClientEvents>;
    public readonly code = Game.makeGameCode();

    /** Map of players by (lowercased) name. */
    private readonly _players = new Map<string, GamePlayer>();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private __currentState: GameStates = { state: 0 };

    private _tracks: [SpotifyTrack, (Video & { id: string }) | null][] = [];

    private _nextRoundTimer?: NodeJS.Timeout;

    public onClose?: (game: Game) => void;

    public get numPlayers() {
        return this._players.size;
    }

    public constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
        this._io = io;
    }

    private set _currentState(newState: GameStates) {
        this.__currentState = newState;
        this._io.to(this.code).emit('gameStateUpdate', newState);
    }

    private get _currentState() {
        return this.__currentState;
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
        // console.log(socket.handshake.auth.username, 'connected', `(${getIpFromSocket(socket)})`);

        const player: GamePlayer = {
            name: username,
            host: this._players.size === 0,
            points: 0,
            state: { state: 0 },
        };

        socket.emit('welcomeToGame', this._currentState, [...this._players.values()]);
        this._io.to(this.code).emit('playerJoined', player);
        socket.join(this.code);

        this._players.set(player.name.toLowerCase(), player);

        // event listeners
        socket.once('disconnect', () => this.handleLeave(socket, player));

        socket.on('chatMessage', (message) => {
            let finalMessage = message.trim().slice(0, 97);
            if (message.length > 97) finalMessage += '...';

            if (finalMessage.length < 1) return;

            this._io.to(this.code).emit('chatMessage', player, finalMessage, undefined);
        });

        socket.on('guessStateUpdate', (newState) => {
            // only accept state changes when active or cooldown
            if (this._currentState.state !== 3 && this._currentState.state !== 4) return;

            if (newState.state === 2) newState.guess = newState.guess.slice(0, 30).trim();

            player.state = newState;

            if ([...this._players.values()].every((e) => e.state.state === 2)) {
                if (this._currentState.state === 3) {
                    this.finishNextTrack(this._currentState as ActiveGameState);
                    this._io.to(this.code).emit('chatMessage', null, 'Skipping to results...', 'gray');
                } else {
                    this.doNextTrack(this._currentState as CooldownGameState);
                    this._io.to(this.code).emit('chatMessage', null, 'Skipping to next track...', 'gray');
                }
            } else {
                this._io.to(this.code).emit('playerStateUpdate', player);
            }
        });

        if (player.host) {
            socket.on('playlistSelected', async (playlistId, accessToken) => {
                try {
                    this._currentState = { state: 1 };
                    await this.handlePlaylistSelect(playlistId, accessToken);
                    this._currentState = { state: 2 };
                } catch (error) {
                    this._currentState = { state: 0 };
                    socket.emit(
                        'chatMessage',
                        null,
                        `Failed to load playlist: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        'lightcoral',
                    );
                }
            });

            socket.on('startGame', () => {
                if (this._currentState.state === 2) {
                    this.doNextTrack(this._currentState);
                } else {
                    socket.emit('chatMessage', null, 'Cannot start game, not ready', 'lightcoral');
                }
            });
        }
    }

    /** Called when an existing socket connection to this game's server is disconnected. */
    private handleLeave(socket: Socket<ClientToServerEvents, ServerToClientEvents>, player: GamePlayer): void {
        socket.offAny();

        if (this._players.size === 1) {
            // this player was the last one, so no need to do anything besides close the lobby
            this.shutdown();
            return;
        }

        if (player.host) {
            // this player was the host, so we also need to just shut down the lobby
            this.shutdown();
            return;
        }

        this._io.to(this.code).emit('playerLeft', player);

        this._players.delete(player.name.toLowerCase());
    }

    private async handlePlaylistSelect(playlistId: string, accessToken: string): Promise<void> {
        try {
            const allTracks = await getAllPlaylistTracks(accessToken, playlistId);

            const allVideos = await Promise.all(allTracks.map((e) => trackToYouTubeVideo(e)));

            this._tracks = new Array(allTracks.length);
            for (let i = 0, len = allTracks.length; i < len; i++) {
                this._tracks[i] = [allTracks[i], allVideos[i]];
            }
        } catch (error) {
            throw new Error('Playlist not found');
        }

        if (this._tracks.length === 0) {
            throw new Error('No tracks present');
        }

        if (this._tracks.length < 3) {
            throw new Error('Not enough tracks (>= 3)');
        }

        // in-place shuffle
        for (let i = this._tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._tracks[i], this._tracks[j]] = [this._tracks[j], this._tracks[i]];
        }
    }

    private doNextTrack(previousState: ReadyGameState | CooldownGameState): void {
        clearTimeout(this._nextRoundTimer);
        this._players.forEach((e) => (e.state = { state: 0 }));
        this._io.to(this.code).emit('bulkPlayerStateUpdated', [...this._players.values()]);
        let trackNumber = 0;

        if (previousState.trackNumber !== undefined) trackNumber = previousState.trackNumber + 1;

        if (trackNumber >= this._tracks.length) {
            this.finish();
            return;
        }

        const [nextTrack, nextVideo] = this._tracks[trackNumber];

        if (nextVideo === null) {
            this._io
                .to(this.code)
                .emit(
                    'chatMessage',
                    null,
                    `Failed to load track "${nextTrack.name}" (${nextTrack.id}), skipping...`,
                    'lightcoral',
                );
            this.doNextTrack({
                state: 2,
                trackNumber,
            });
            return;
        }

        // for a 30 second window, we want to make sure we don't start playback when there's less than 30 seconds to
        // go, plus 5 seconds of padding on either side
        const maxDurationAllowed = Math.floor(nextVideo.duration / 1000) - 30 - 15 - 5 * 2;

        const startAt = 5 + Math.floor(Math.random() * maxDurationAllowed);

        const activeState: ActiveGameState = {
            state: 3,
            trackNumber,
            outOf: this._tracks.length,
            videoId: nextVideo.id,
            startAt,
            startedAt: new Date().toISOString(),
            windowSize: 30,
        };

        this._currentState = activeState;
        this._nextRoundTimer = setTimeout(() => this.finishNextTrack(activeState), 30_000);
    }

    private finishNextTrack(previousState: ActiveGameState): void {
        clearTimeout(this._nextRoundTimer);
        const [track, video] = this._tracks[previousState.trackNumber];

        const trackName = track.name.toLowerCase();
        const videoName = video?.title?.toLowerCase();
        const acceptedGuesses = trackName.split(" ");

        const isCorrect = (playerGuess: string) => {
            playerGuess = playerGuess.toLowerCase();
            if (playerGuess === trackName) return true;
            if (playerGuess === videoName) return true;
            if (playerGuess.length > 3 && trackName.startsWith(playerGuess)) return true;
            if (playerGuess.length > 5) {
                for (const acceptedGuess of acceptedGuesses) {
                    if (acceptedGuess === playerGuess) {
                        return true;
                    }
                }
            }
            
            return false;
        };

        const cooldownState: CooldownGameState = {
            ...previousState,
            startedAt: new Date().toISOString(),
            startAt: previousState.startAt + previousState.windowSize,
            state: 4,
            track: {
                title: track.name,
                artists: track.artists.map((e) => e.name),
                thumbnail: track.album.images.at(0)?.url,
            },
            windowSize: 15,
        };
        this._currentState = cooldownState;

        this._players.forEach((e) => {
            if (e.state.state === 2) {
                if (isCorrect(e.state.guess)) {
                    e.points++;
                    e.state = { state: 4 };
                } else {
                    e.state = { state: 3, guess: e.state.guess };
                }
            } else {
                e.state = { state: 3, guess: '' };
            }
        });

        this._io.to(this.code).emit('bulkPlayerStateUpdated', [...this._players.values()]);

        this._nextRoundTimer = setTimeout(() => this.doNextTrack(cooldownState), 15_000);
    }

    private finish(): void {
        clearTimeout(this._nextRoundTimer);
        this._currentState = { state: 0 };

        let winner: GamePlayer | null = null;

        for (const [, player] of this._players) {
            if (winner === null || player.points > winner.points) {
                winner = player;
            }
        }

        if (winner !== null) {
            this._io.to(this.code).emit('chatMessage', null, `${winner.name} has won the game`, 'gold');
        } else {
            this._io.to(this.code).emit('chatMessage', null, 'Nobody has won the game lol', 'gold');
        }
    }

    /**
     * Called after {@link handleLeave} if there are no {@link _players players} remaining,
     * or externally.
     */
    public shutdown(): void {
        clearTimeout(this._nextRoundTimer);
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
