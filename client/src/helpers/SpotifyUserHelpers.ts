import SpotifyUser from '../../../shared/Spotify/SpotifyUser';

const USER_KEY = 'spotifyQuiz.User';

export function getLocalSpotifyUser(): SpotifyUser | null {
    const existingUser = localStorage.getItem(USER_KEY);
    if (existingUser === null) return null;
    return JSON.parse(existingUser);
}

export function saveLocalSpotifyUser(user: SpotifyUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLocalSpotifyUser() {
    localStorage.removeItem(USER_KEY);
}
