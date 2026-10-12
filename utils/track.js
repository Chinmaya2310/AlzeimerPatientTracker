import {distanceKm, pathLengthKm} from './geo';

// Summary numbers for a saved walk
export const summarizeTrack = track => {
  const locs = track.locations || [];
  const first = locs[0];
  const last = locs[locs.length - 1];
  const minutes =
    first && last && first.timestamp && last.timestamp
      ? Math.max(0, Math.round((last.timestamp - first.timestamp) / 60000))
      : null;
  const farthest = first
    ? Math.max(0, ...locs.map(l => distanceKm(first.coords, l.coords)))
    : 0;
  return {
    date: first && first.timestamp ? new Date(first.timestamp) : null,
    lengthKm: pathLengthKm(locs),
    farthestKm: farthest,
    minutes,
    points: locs.length,
  };
};
