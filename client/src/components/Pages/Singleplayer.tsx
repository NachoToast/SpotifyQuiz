import React from 'react';
import { useSelector } from 'react-redux';
import { getOAuthLink, getSpotifyOAuth } from '../../redux/mainSlice';
import ExternalLink from '../Links/ExternalLink';
import InternalLink from '../Links/InternalLink';
import PlaylistSelector from '../PlaylistSelector';

const Singleplayer = () => {
    const authLink = useSelector(getOAuthLink);
    const spotifyOAuth = useSelector(getSpotifyOAuth);

    if (spotifyOAuth === null) {
        return (
            <div>
                <h1>Singleplayer</h1>
                <p>You need to be logged into Spotify to play.</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <ExternalLink href={authLink}>Login to Spotify</ExternalLink>
                    <InternalLink href="/">Home</InternalLink>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Singleplayer</h1>
            <PlaylistSelector spotifyOAuth={spotifyOAuth} />
        </div>
    );
};

export default Singleplayer;
