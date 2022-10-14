import { useMemo } from 'react';
import GamePlayer from '../../../../shared/GamePlayer';
import { ActiveGameState, CooldownGameState } from '../../../../shared/GameStates';
import './ActiveSong.css';

const ActiveSong = ({ state, me }: { state: ActiveGameState | CooldownGameState; me: GamePlayer }) => {
    const trueStart = useMemo(() => {
        const playbackStartedSecondsAgo = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);

        console.log(state.startAt, playbackStartedSecondsAgo, state.startAt + playbackStartedSecondsAgo);
        return state.startAt + playbackStartedSecondsAgo;
    }, [state.startAt, state.startedAt]);

    return (
        <div className="activeSongContainer">
            <iframe
                className={`activeSong ${state.state === 3 ? 'hidden' : 'visible'}`}
                width="90%"
                height="80%"
                src={`https://www.youtube.com/embed/${state.videoId}?autoplay=1&disablekb=1&start=${trueStart}`}
                allow="autoplay"
                title="Video"
            />
            {state.state === 4 && (
                <div className="correctSong">
                    {state.track.thumbnail !== undefined && <img src={state.track.thumbnail} alt="Track Thumbnail" />}
                    <div className="correctSongInfo">
                        <h2>{state.track.title}</h2>
                        <p>{state.track.artists.join(', ')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveSong;
