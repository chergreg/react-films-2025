import type { Movie } from "../types/domains";
import type { MovieTMDB, TMDBCastItem } from "../types/tmdb";
import { buildImageUrl, buildProfileUrl, getYear } from "../utils/utils";
import type { ActorCredit } from "../types/domains/ActorCredit";

export function mapMovie(tmdb: MovieTMDB): Movie {
  return {
    id: tmdb.id,
    title: tmdb.title,
    originalTitle: tmdb.original_title,
    tagline: tmdb.tagline ?? undefined,
    overview: tmdb.overview ?? undefined,
    posterUrl: buildImageUrl(tmdb.poster_path, "w342"),
    backdropUrl: buildImageUrl(tmdb.backdrop_path, "w500"),
    releaseDate: tmdb.release_date ?? undefined,
    year: getYear(tmdb.release_date ?? undefined),
    genres: (tmdb.genres ?? []).map(g => ({ id: g.id, name: g.name })),
    rating: typeof tmdb.vote_average === "number" ? tmdb.vote_average : undefined,
    cast: mapCast(tmdb.credits?.cast ?? []), // top 10 dedans
  };
}

export function mapCast(cast: TMDBCastItem[]): ActorCredit[] {
  // Tri par "order" (priorité TMDB) puis top 10
  const sorted = [...cast].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).slice(0, 10);
  return sorted.map(c => ({
    id: c.id,
    name: c.name,
    character: c.character ?? undefined,
    profileUrl: buildProfileUrl(c.profile_path, "w185"),
    order: c.order ?? undefined,
  }));
}
