import { SpotifyTrack } from '../../../shared/Spotify';
import YouTube, { Video } from 'youtube-sr';

export default async function trackToYouTubeVideo(
    track: SpotifyTrack,
    limit = 3,
): Promise<(Video & { id: string }) | null> {
    const artistString = track.artists.map((e) => e.name).join(', ');

    const results = await YouTube.search(`${artistString} - ${track.name}`, { limit, type: 'video' });

    if (results.length === 0) return null;

    const resultWeights = new Array(limit);

    for (let i = 0; i < limit; i++) {
        resultWeights[i] = Math.abs(track.duration_ms - results[i].duration);
    }

    const closestDurationIndex = resultWeights.indexOf(Math.min(...resultWeights));

    const bestResult = results[closestDurationIndex];

    if (bestResult.id === undefined) return null;

    return bestResult as Video & { id: string };
}
