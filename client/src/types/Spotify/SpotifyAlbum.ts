import SpotifyArtist from './SpotifyArtist';
import SpotifyExternalURLs from './SpotifyExternalURLs';
import SpotifyImage from './SpotifyImage';

export default interface SpotifyAlbum {
    album_type: 'album' | 'single' | 'compilation';

    artists: SpotifyArtist[];

    available_markets: string[];

    external_urls: SpotifyExternalURLs;

    href: string;

    id: string;

    images: SpotifyImage[];

    name: string;

    release_date: string;

    release_date_precision: 'day' | 'month' | 'year';

    total_tracks: number;

    type: 'album';

    uri: string;
}
