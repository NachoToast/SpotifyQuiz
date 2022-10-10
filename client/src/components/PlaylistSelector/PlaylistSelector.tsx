import React, { useCallback, useMemo, useState } from 'react';
import SpotifyPlaylist from '../../../../shared/Spotify/SpotifyPlaylist';
import { getAllPlaylistTracks } from '../../Providers/Spotify/SpotifyHelpers';
import './PlaylistSelector.css';

export interface PlaylistSelectorProps {
    playlists: SpotifyPlaylist[] | null;
    accessToken: string;
}

const PlaylistSelector = ({ playlists, accessToken }: PlaylistSelectorProps) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState<number>(-1);
    const [directUrl, setDirectUrl] = useState('');
    const [feedback, setFeedback] = useState('');

    const randomEmoji = useMemo(() => {
        const emojis = ['🥶', '🍦', '💚', '😎', '🥰', '🥝', '💀', '👍', '🍊', '👻', '🎵'];

        return emojis[Math.floor(Math.random() * emojis.length)];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlaylist]);

    const handlePlaylistChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setDirectUrl('');
        setSelectedPlaylist(e.target.value as unknown as number);
    }, []);

    const handleDirectUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDirectUrl(e.target.value);
        setSelectedPlaylist(-1);
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement | HTMLInputElement>) => {
            e.preventDefault();
            setFeedback('');

            let playlistId: string;

            if (directUrl !== '') {
                let url: URL;
                try {
                    try {
                        url = new URL(directUrl);
                    } catch (error) {
                        throw new Error('Invalid URL');
                    }
                    if (url.hostname !== 'open.spotify.com') throw new Error('Must be a Spotify URL');
                    if (!url.pathname.startsWith('/playlist/')) throw new Error('Must be a playlist URL');
                    playlistId = url.pathname.slice('/playlist/'.length);
                } catch (error) {
                    setFeedback((error as Error).message);
                    return;
                }
            } else if (selectedPlaylist !== -1) {
                if (playlists === null) {
                    setFeedback('Please wait while we load your playlists');
                    return;
                }
                playlistId = playlists[selectedPlaylist].id;
            } else return;

            setFeedback('Loading tracks....');

            const controller = new AbortController();

            getAllPlaylistTracks(accessToken, playlistId, controller)
                .then((e) => {
                    console.log(e);
                })
                .catch((e) => {
                    console.log(e);
                });

            return () => {
                controller.abort();
            };
        },
        [accessToken, directUrl, playlists, selectedPlaylist],
    );

    return (
        <form className="playlistSelector" onSubmit={handleSubmit}>
            <label htmlFor="playlistDropdown">Select a playlist</label>
            <div style={{ display: 'flex' }}>
                {playlists === null ? (
                    <p style={{ color: 'gray', textAlign: 'center' }}>Loading your playlists...</p>
                ) : (
                    <>
                        <select name="playlistDropdown" value={selectedPlaylist} onChange={handlePlaylistChange}>
                            <option value={-1} disabled hidden></option>
                            {playlists.map((e, i) => (
                                <option key={e.id} value={i}>
                                    {e.name} ({e.tracks.total} Songs)
                                </option>
                            ))}
                        </select>
                        {selectedPlaylist !== -1 && playlists[selectedPlaylist].images.at(0) !== undefined ? (
                            <img
                                className="playlistPreview"
                                src={playlists[selectedPlaylist].images[0].url}
                                alt="Playlist thumbnail"
                            />
                        ) : (
                            <div className="playlistPreview">{randomEmoji}</div>
                        )}
                    </>
                )}
            </div>
            <label htmlFor="playlistDirect">Or enter a URL</label>
            <input type="text" name="playlistDirect" value={directUrl} onChange={handleDirectUrlChange} />
            {feedback !== '' && (
                <span style={{ color: 'lightcoral', textAlign: 'center', marginTop: '1em', marginBottom: '-2em' }}>
                    {feedback}
                </span>
            )}
            <input type="submit" onSubmit={handleSubmit} />
        </form>
    );
};

export default PlaylistSelector;
