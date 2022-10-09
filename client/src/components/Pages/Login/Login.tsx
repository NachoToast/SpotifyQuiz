import { useContext, useEffect, useState } from 'react';
import ExternalLink from '../../Links/ExternalLink';
import InternalLink from '../../Links/InternalLink';
import { SettingsContext, SpotifyContext } from '../../../Contexts';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const {
        settings,
        sessionData: { state: sessionState, oAuthLink },
    } = useContext(SettingsContext);
    const { controllers: spotifyControllers } = useContext(SpotifyContext);

    const [title, setTitle] = useState('Loading');
    const [subtitle, setSubtitle] = useState('Deciding what to do...');
    const [subtitleColour, setSubtitleColour] = useState<'gray' | 'lightcoral' | 'lightgreen'>('gray');
    const [leftButtonText, setLeftButtonText] = useState('Try Again');
    const [description, setDescription] = useState<string | undefined>(undefined);

    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        if (loggedIn) return;
        const params = new URLSearchParams(window.location.search);

        const error = params.get('error');
        const code = params.get('code');
        const state = params.get('state');

        if (error !== null) {
            if (error === 'access_denied') {
                setTitle('Access Denied');
                setSubtitle('You clicked cancel');
                setSubtitleColour('lightcoral');
            } else {
                setTitle('Unknown Error');
                setSubtitle('Unknown response from Spotify');
                setSubtitleColour('lightcoral');
                setDescription(error);
            }
            return;
        }

        if (code === null || state === null) {
            setTitle('Invalid Query');
            setSubtitle('How did you get here?');
            setLeftButtonText('Login to Spotify');
            return;
        }

        if (state !== sessionState) {
            setTitle('Security Error');
            setSubtitle("Your request might've been intercepted");
            setSubtitleColour('lightcoral');
            setDescription("Check you're on a secure network");
            return;
        }

        setTitle('Finishing Login');
        setSubtitle('Waiting for server response...');

        spotifyControllers.requestLogin(code, settings.redirectURI).then((e) => {
            if (e === true) {
                setLoggedIn(true);
                setTitle('Logged In');
                setSubtitle('Success!');
                setLeftButtonText('');
                setSubtitleColour('lightgreen');
                navigate('/');
            } else {
                setTitle(e.title);
                setSubtitle(e.subtitle);
                setSubtitleColour('lightcoral');
                setDescription(e.description);
            }
        });
    }, [loggedIn, navigate, sessionState, settings.redirectURI, settings.serverUrl, spotifyControllers]);

    return (
        <div>
            <h1>{title}</h1>
            <p style={{ textAlign: 'center', color: subtitleColour }}>
                {subtitle}
                {description !== undefined && (
                    <>
                        <br />
                        <span style={{ color: 'gray' }}>{description}</span>
                    </>
                )}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {leftButtonText !== '' && <ExternalLink href={oAuthLink}>{leftButtonText}</ExternalLink>}
                <InternalLink href="/">Home</InternalLink>
            </div>
        </div>
    );
};

export default Login;
