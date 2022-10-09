import { useContext, useEffect, useRef, useState } from 'react';
import SpotifyUser from '../../../../shared/Spotify/SpotifyUser';
import { SpotifyContext } from '../../Contexts';
import './AlertModal.css';

type Notification = null | 'loggedOut' | 'refreshed' | SpotifyUser;

const AlertModal = () => {
    const [notification, setNotification] = useState<Notification>(null);
    const { events: spotifyEvents } = useContext(SpotifyContext);

    useEffect(() => {
        spotifyEvents.on('loggedIn', (user) => setNotification(user));
        spotifyEvents.on('loggedOut', () => setNotification('loggedOut'));
        spotifyEvents.on('refreshed', () => setNotification('refreshed'));

        return () => {
            spotifyEvents.off('loggedIn', (user) => setNotification(user));
            spotifyEvents.off('loggedOut', () => setNotification('loggedOut'));
            spotifyEvents.off('refreshed', () => setNotification('refreshed'));
        };
    }, [spotifyEvents]);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (notification === null) return;
        const { current } = ref;
        if (current === null) return;

        const timeout = setTimeout(() => {
            current.classList.add('fadingOut');
        }, 3_000);

        const timeout2 = setTimeout(() => {
            setNotification(null);
        }, 3_300);

        return () => {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            current.classList.remove('fadingOut');
        };
    }, [notification]);

    switch (notification) {
        case null:
            return <></>;
        case 'loggedOut':
            return (
                <div ref={ref} id="alertModal">
                    Logged out
                </div>
            );
        case 'refreshed':
            return (
                <div ref={ref} id="alertModal">
                    Refreshed
                </div>
            );
        default:
            break;
    }

    return (
        <div ref={ref} id="alertModal">
            {notification.images.at(0) !== undefined && (
                <img src={notification.images[0].url} alt="Your Spotify profile" />
            )}
            <span>
                Logged in as <span>{notification.display_name}</span>
            </span>
        </div>
    );
};

export default AlertModal;
