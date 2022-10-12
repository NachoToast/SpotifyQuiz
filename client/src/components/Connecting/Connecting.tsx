import { useEffect, useState } from 'react';
import './Connecting.css';

const Connecting = () => {
    const [isTakingTooLong, setIsTakingTooLong] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsTakingTooLong(true);
        }, 5_000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            style={{
                textAlign: 'center',
            }}
        >
            <p>Connecting to the SpotifyQuiz Server...</p>

            <p className="tooLongText" style={{ animationPlayState: isTakingTooLong ? 'running' : 'paused' }}>
                This seems to be taking a while, our servers might be down 💀
            </p>
        </div>
    );
};

export default Connecting;
