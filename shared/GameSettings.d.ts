export default interface GameSettings {
    /** Spotify playlist ID to get songs from. */
    playlistId: string;

    /** Spotify OAuth access token for lobby owner. */
    accessToken: string;

    /**
     * How many seconds users have to guess the song.
     *
     * @default 30
     */
    playbackDuration: number;

    /**
     * Whether to play from the start of the song, or at a
     * random place.
     *
     * @default 'start'
     */
    playbackOffset: 'start' | 'random';

    /**
     * Whether users should have to guess the title or the
     * artist of the song.
     *
     * @default 'title'
     */
    guessThe: 'title' | 'artist';
}
