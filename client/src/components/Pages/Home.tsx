import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import GamePlayer from '../../../../shared/GamePlayer';
import { GameStates } from '../../../../shared/GameStates';
import { ServerToClientEvents, ClientToServerEvents } from '../../../../shared/SocketEvents';
import { api } from '../../api';
import { SettingsContext, SpotifyContext } from '../../Contexts';
import Game from '../Game';
import ExternalLink from '../Links/ExternalLink';

const usernameValidation = new RegExp(/^([a-zA-Z0-9]| ){2,20}$/);

const Home = () => {
    const {
        sessionData: { oAuthLink },
    } = useContext(SettingsContext);

    const { settings } = useContext(SettingsContext);

    const { spotify } = useContext(SpotifyContext);

    const [gameCode, setGameCode] = useState(window.location.hash.slice(1));
    const [username, setUsername] = useState(localStorage.getItem('SpotifyQuiz.Username') ?? '');

    const [isCreateMode, setIsCreateMode] = useState(false);

    useEffect(() => {
        const handleHashChange = (e: HashChangeEvent) => {
            e.preventDefault();
            const newHash = window.location.hash.slice(1);
            if (newHash !== '') {
                setGameCode(newHash);
            }
        };

        window.onhashchange = handleHashChange;

        return () => {
            window.onhashchange = null;
        };
    }, []);

    useEffect(() => localStorage.setItem('SpotifyQuiz.Username', username), [username]);

    const [customMainText, setCustomMainText] = useState<[string, string | undefined] | null>(null);

    const [intialGameData, setInitialGameData] = useState<{
        gameState: GameStates;
        players: GamePlayer[];
        socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    } | null>(null);

    const usernameStatus = useMemo(() => {
        if (username === '') return 'Missing username';
        if (username.length < 2) return 'Username too short';
        if (username.length > 20) return 'Username too long';
        if (!usernameValidation.test(username)) return 'Username invalid';

        return true;
    }, [username]);

    const canSubmit = useMemo(() => {
        if (usernameStatus !== true) return false;
        if (isCreateMode) return spotify !== null;
        return gameCode.trim() !== '';
    }, [gameCode, isCreateMode, spotify, usernameStatus]);

    const instantiateSocket = useCallback(
        (gameCode: string) => {
            const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`${settings.serverUrl}`, {
                auth: { username, gameCode },
            });

            new Promise<{ gameState: GameStates; players: GamePlayer[] }>((resolve, reject) => {
                socket.once('connect_error', () => {
                    setCustomMainText(['Game not found', 'lightcoral']);
                    reject();
                });
                socket.once('disconnect', () => {
                    setCustomMainText(['Game not found (2)', 'lightcoral']);
                    reject();
                });
                socket.once('setNameFailed', (reason) => {
                    let newMainText: string;
                    switch (reason) {
                        case 'invalidChars':
                            newMainText = 'Username invalid';
                            break;
                        case 'taken':
                            newMainText = 'Username taken';
                            break;
                        case 'tooLong':
                            newMainText = 'Username too long';
                            break;
                        case 'tooShort':
                            newMainText = 'Username too short';
                            break;
                        case 'missing':
                            newMainText = 'Username missing';
                            break;
                    }
                    setCustomMainText([newMainText, 'lightcoral']);
                    reject();
                });
                socket.once('welcomeToGame', (gameState, players) => {
                    resolve({ gameState, players });
                });
            })
                .then(({ gameState, players }) => {
                    socket.off('connect_error');
                    socket.off('disconnect');
                    socket.off('setNameFailed');
                    setInitialGameData({ socket, gameState, players });
                })
                .catch(() => {
                    socket.off();
                    socket.disconnect();
                });
        },
        [settings.serverUrl, username],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!canSubmit) return;

            if (isCreateMode) {
                api.createGame(settings.serverUrl, settings.rateLimitBypassToken).then((e) => {
                    if (e.success) {
                        setGameCode(e.data);
                        instantiateSocket(e.data);
                    } else {
                        setCustomMainText([e.error.subtitle, 'lightcoral']);
                    }
                });
            } else instantiateSocket(gameCode);
        },
        [canSubmit, gameCode, instantiateSocket, isCreateMode, settings.rateLimitBypassToken, settings.serverUrl],
    );

    useEffect(() => {
        if (intialGameData === null) return;

        const handleDisconnect = (_reason: Socket.DisconnectReason) => {
            intialGameData.socket.off();
            setCustomMainText(['Disconnected', 'lightcoral']);
            setInitialGameData(null);
        };

        intialGameData.socket.once('disconnect', handleDisconnect);

        return () => {
            intialGameData.socket.off('disconnect', handleDisconnect);
        };
    }, [intialGameData]);

    const [mainText, mainTextColour] = useMemo(() => {
        if (customMainText !== null) {
            return customMainText;
        }
        if (isCreateMode) {
            if (spotify === null) return ['Spotify login required', 'lightcoral'];
        }
        return ['How well do you know your Spotify playlists?', undefined];
    }, [customMainText, isCreateMode, spotify]);

    if (intialGameData !== null) return <Game {...intialGameData} gameCode={gameCode} username={username} />;

    return (
        <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center' }}>
            <h1>Spotify Quiz</h1>
            <p style={{ textAlign: 'center', color: mainTextColour }}>{mainText}</p>
            {isCreateMode && spotify === null && (
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <ExternalLink href={oAuthLink}>Login to Spotify</ExternalLink>
                </div>
            )}
            <form style={{ display: 'flex', flexFlow: 'column nowrap' }} onSubmit={handleSubmit}>
                {!isCreateMode && (
                    <>
                        <label htmlFor="gameCode" style={{ color: 'gray' }}>
                            Game Code
                        </label>
                        <input
                            name="gameCode"
                            type="text"
                            onChange={(e) => {
                                e.preventDefault();
                                setGameCode(e.target.value);
                            }}
                            value={gameCode}
                            autoComplete="off"
                            autoCorrect="off"
                        />
                    </>
                )}
                <label
                    htmlFor="username"
                    style={{
                        marginTop: '0.5em',
                        color: usernameStatus === true || username.length < 2 ? 'gray' : 'lightcoral',
                    }}
                >
                    {usernameStatus === true || username.length < 2 ? 'Username' : usernameStatus}
                </label>
                <input
                    name="username"
                    type="text"
                    minLength={2}
                    maxLength={20}
                    onChange={(e) => {
                        e.preventDefault();
                        setUsername(e.target.value.trim());
                    }}
                    value={username}
                />

                <input
                    type="submit"
                    value="Go"
                    disabled={!canSubmit}
                    readOnly
                    onClick={handleSubmit}
                    style={{ marginTop: '0.5em' }}
                    autoFocus
                />
            </form>

            <p
                className="linkLike"
                onClick={(e) => {
                    e.preventDefault();
                    setIsCreateMode(!isCreateMode);
                }}
            >
                {isCreateMode ? 'Join a game instead' : 'Create a game instead'}
            </p>
        </div>
    );
};

export default Home;
