import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sessionState } from '../../../helpers/SpotifyAuthHelpers';
import { getOAuthLink, getSettings, setSpotifyOAuth } from '../../../redux/mainSlice';
import ExternalLink from '../../Links/ExternalLink';
import InternalLink from '../../Links/InternalLink';
import { AppDispatch } from '../../../redux/store';
import api from '../../../api';

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authLink = useSelector(getOAuthLink);
    const settings = useSelector(getSettings);

    const [title, setTitle] = useState('Loading');
    const [subtitle, setSubtitle] = useState('Deciding what to do...');
    const [subtitleColour, setSubtitleColour] = useState<'gray' | 'lightcoral' | 'lightgreen'>('gray');
    const [leftButtonText, setLeftButtonText] = useState('Try Again');
    const [description, setDescription] = useState<string | undefined>(undefined);

    useEffect(() => {
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

        const controller = new AbortController();

        api.requestSpotifyAccessToken(settings.serverUrl, code, {
            controller,
            rateLimitBypassToken: settings.rateLimitBypassToken,
        }).then((e) => {
            if (e.success) {
                dispatch(setSpotifyOAuth(e.data));
                setTitle('Logged In');
                setSubtitle('Success!');
                setLeftButtonText('');
                setSubtitleColour('lightgreen');
                window.location.href = '/';
            } else {
                console.log(e.error);
                setTitle(e.error.title);
                setSubtitle(e.error.subtitle);
                setSubtitleColour('lightcoral');
                setDescription(e.error.description);
            }
        });
        return () => {
            controller.abort();
        };
    }, [dispatch, settings.rateLimitBypassToken, settings.serverUrl]);

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
                {leftButtonText !== '' && <ExternalLink href={authLink}>{leftButtonText}</ExternalLink>}
                <InternalLink href="/">Home</InternalLink>
            </div>
        </div>
    );
};

export default Login;
