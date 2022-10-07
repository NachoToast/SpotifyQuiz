import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotification, clearNotification } from '../../redux/mainSlice';
import { AppDispatch } from '../../redux/store';
import './AlertModal.css';

const AlertModal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const notification = useSelector(getNotification);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (notification === null) return;
        const { current } = ref;
        if (current === null) return;

        const timeout = setTimeout(() => {
            current.classList.add('fadingOut');
        }, 3_000);

        const timeout2 = setTimeout(() => {
            dispatch(clearNotification());
        }, 3_300);

        return () => {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            current.classList.remove('fadingOut');
        };
    }, [dispatch, notification]);

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
            {notification[1].images.at(0) !== undefined && (
                <img src={notification[1].images[0].url} alt="Your Spotify profile" />
            )}
            <span>
                Logged in as <span>{notification[1].display_name}</span>
            </span>
        </div>
    );
};

export default AlertModal;
