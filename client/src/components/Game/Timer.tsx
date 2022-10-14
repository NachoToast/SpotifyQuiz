import React, { useEffect, useState } from 'react';
import { ActiveGameState, CooldownGameState } from '../../../../shared/GameStates';

const Timer = (state: ActiveGameState | CooldownGameState) => {
    const [timeRemaining, setTimeRemaining] = useState(state.windowSize);

    useEffect(() => {
        const secondsElapsed = Math.ceil((Date.now() - new Date(state.startedAt).getTime()) / 1000);
        const interval = setInterval(() => setTimeRemaining(state.windowSize - secondsElapsed), 1_000);

        return () => {
            clearInterval(interval);
        };
    }, [state.startAt, state.startedAt, state.windowSize, timeRemaining]);

    return (
        <span
            className="gameTimerWindow"
            style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                padding: '0.1em 0.2em',
                color: timeRemaining <= 5 ? 'lightcoral' : undefined,
            }}
        >
            {timeRemaining}s
        </span>
    );
};

export default Timer;
