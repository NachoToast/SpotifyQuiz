/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OptionsBar.css';
import githubIcon from './github.svg';
import settingsIcon from './settings.svg';

const OptionsBar = () => {
    const location = useLocation();

    const settingsButtonRef = useRef<HTMLAnchorElement>(null);

    const [href, setHref] = useState('/settings');

    useEffect(() => {
        if (location.pathname !== '/settings') return;

        const { current } = settingsButtonRef;
        if (current === null) return;

        current.classList.add('active');
        setHref('/');

        return () => {
            current.classList.remove('active');
            setHref('/settings');
        };
    }, [location, settingsButtonRef]);

    return (
        <div id="optionBar">
            <a
                href="https://github.com/NachoToast/SpotifyQuiz"
                rel="noreferrer"
                target="_blank"
                id="githubButton"
                style={{ backgroundImage: `url(${githubIcon})` }}
                title="GitHub"
            />
            <Link
                ref={settingsButtonRef}
                to={href}
                id="settingsButton"
                style={{ backgroundImage: `url(${settingsIcon})` }}
                title="Settings"
            />
        </div>
    );
};

export default OptionsBar;
