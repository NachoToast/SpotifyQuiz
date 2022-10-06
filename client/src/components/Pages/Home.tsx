import React from 'react';
import InternalLink from '../Links/InternalLink';

const Home = () => {
    return (
        <div>
            <h1>Spotify Quiz</h1>
            <p style={{ textAlign: 'center' }}>How well do you know your Spotify playlists?</p>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
                <InternalLink href="/singleplayer">Singleplayer</InternalLink>
                <InternalLink href="/multiplayer">Multiplayer</InternalLink>
            </div>
        </div>
    );
};

export default Home;
