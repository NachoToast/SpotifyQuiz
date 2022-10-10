import React from 'react';

const Home = () => {
    return (
        <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center' }}>
            <h1>Spotify Quiz</h1>
            <p style={{ textAlign: 'center' }}>How well do you know your Spotify playlists?</p>
            <form style={{ display: 'flex', flexFlow: 'row nowrap' }}>
                <input type="text" placeholder="Enter Game Code" name="gameCodeInput" />
                <input
                    type="submit"
                    value="Go"
                    readOnly
                    style={{ marginLeft: '0.2em' }}
                    onClick={(e) => e.preventDefault()}
                />
            </form>
            <p>Or create a game instead</p>
        </div>
    );
};

export default Home;
