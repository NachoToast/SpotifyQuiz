import SpotifyAlbum from './SpotifyAlbum';
import SpotifyArtist from './SpotifyArtist';
import SpotifyExternalURLs from './SpotifyExternalURLs';

export default interface SpotifyTrack {
    album: SpotifyAlbum;

    artists: SpotifyArtist[];

    available_markets: string[];

    disc_number: number;

    duration_ms: number;

    episode: boolean;

    explicit: boolean;

    external_ids: {
        isrc: string;
    };

    external_urls: SpotifyExternalURLs;

    href: string;

    id: string;

    is_local: boolean;

    name: string;

    popularity: number;

    preview_url: string;

    track: boolean;

    track_number: number;

    type: 'track';

    uri: string;
}
