import React, { useContext } from 'react';
import { SettingsContext, SpotifyContext } from '../../Contexts';
import ExternalLink from '../Links/ExternalLink';
import InternalLink from '../Links/InternalLink';
import PlaylistSelector from '../PlaylistSelector';

const Singleplayer = () => {
    const {
        sessionData: { oAuthLink },
    } = useContext(SettingsContext);
    const { spotify } = useContext(SpotifyContext);

    if (spotify === null) {
        return (
            <div>
                <h1>Singleplayer</h1>
                <p>You need to be logged into Spotify to play.</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <ExternalLink href={oAuthLink}>Login to Spotify</ExternalLink>
                    <InternalLink href="/">Home</InternalLink>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Singleplayer</h1>
            <PlaylistSelector playlists={spotify.playlists} accessToken={spotify.authData.access_token} />
        </div>
    );
};

export default Singleplayer;
