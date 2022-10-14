import SpotifyExternalURLs from './SpotifyExternalURL';

export default interface SpotifyArtist {
    external_urls: SpotifyExternalURLs;

    href: string;

    id: string;

    name: string;

    type: 'artist';

    uri: string;
}
