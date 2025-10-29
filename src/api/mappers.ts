import type { Movie } from "../types/domains";
import type { MovieTMDB } from "../types/tmdb";
import { buildImageUrl, getYear } from "../utils/utils";

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
  };
}
