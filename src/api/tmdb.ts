import axios from "axios";
import type { Movie } from "../types/domains";
import type { MovieTMDB, TMDBCastItem } from "../types/tmdb";
import { mapMovie } from "./mappers";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: { api_key: import.meta.env.VITE_TMDB_API_KEY },
});

type FR = "fr-CA" | "fr-FR";
type EN = "en-US";

function isEmptyText(v?: string | null) {
  return !v || v.trim().length === 0;
}

function isEssentialMissing(m?: MovieTMDB) {
  if (!m) return true;
  const missingOverview = isEmptyText(m.overview);
  const missingTagline = isEmptyText(m.tagline);
  const missingGenres = !m.genres || m.genres.length === 0;
  return missingOverview || missingTagline || missingGenres;
}

async function fetchMovieWithCredits(id: string, language: string) {
  const { data } = await api.get<MovieTMDB>(`/movie/${id}`, {
    params: { language, append_to_response: "credits" },
  });
  return data;
}

/** Merge FR avec EN pour le film ET le casting (champ par champ) */
function mergeMovieFRwithEN(fr: MovieTMDB, en: MovieTMDB): MovieTMDB {
  const merged: MovieTMDB = {
    ...fr,
    title: !isEmptyText(fr.title) ? fr.title : en.title,
    original_title: !isEmptyText(fr.original_title) ? fr.original_title : en.original_title,
    tagline: !isEmptyText(fr.tagline) ? fr.tagline : en.tagline,
    overview: !isEmptyText(fr.overview) ? fr.overview : en.overview,
    poster_path: fr.poster_path ?? en.poster_path,
    backdrop_path: fr.backdrop_path ?? en.backdrop_path,
    release_date: fr.release_date ?? en.release_date,
    genres: (fr.genres && fr.genres.length > 0) ? fr.genres : (en.genres ?? []),
    vote_average: typeof fr.vote_average === "number" ? fr.vote_average : en.vote_average,
    credits: {
      id: fr.credits?.id ?? en.credits?.id ?? fr.id,
      cast: mergeCast(fr.credits?.cast ?? [], en.credits?.cast ?? []),
      crew: fr.credits?.crew ?? en.credits?.crew ?? [],
    },
  };
  return merged;
}

/** Complete le cast FR avec les champs manquants depuis EN (par id de personne) */
function mergeCast(frCast: TMDBCastItem[], enCast: TMDBCastItem[]): TMDBCastItem[] {
  // index EN par id
  const enById = new Map(enCast.map(c => [c.id, c] as const));
  const completed = frCast.map(fr => {
    const en = enById.get(fr.id);
    if (!en) return fr;
    return {
      ...fr,
      name: !isEmptyText(fr.name) ? fr.name : en.name,
      character: !isEmptyText(fr.character) ? fr.character : en.character,
      profile_path: fr.profile_path ?? en.profile_path,
      order: fr.order ?? en.order,
    } as TMDBCastItem;
  });
  // Si FR est vide, on prend EN
  return completed.length > 0 ? completed : enCast;
}

/**
 * 1) FR (fr-CA ou fr-FR) avec credits
 * 2) Si essentiels manquent, EN puis merge (film + cast)
 * 3) map -> modèle interne Movie (incluant cast top 10)
 */
export async function getMovieWithCastFrThenCompleteWithEn(
  id: string,
  preferredFr: FR = "fr-CA"
): Promise<{
  movie: Movie;
  languageUsed: FR | EN | "fr+en";
  usedFallback: boolean;
  completed: { overview?: boolean; tagline?: boolean; genres?: boolean; cast?: boolean };
}> {
  const fr = await fetchMovieWithCredits(id, preferredFr);
  if (!isEssentialMissing(fr)) {
    return {
      movie: mapMovie(fr),
      languageUsed: preferredFr,
      usedFallback: false,
      completed: {},
    };
  }
  const en = await fetchMovieWithCredits(id, "en-US");
  const merged = mergeMovieFRwithEN(fr, en);

  // Indiquer quels blocs ont été complétés (info pédagogique)
  const completed = {
    overview: isEmptyText(fr.overview) && !isEmptyText(en.overview),
    tagline: isEmptyText(fr.tagline) && !isEmptyText(en.tagline),
    genres: (!fr.genres || fr.genres.length === 0) && !!(en.genres && en.genres.length > 0),
    cast: (fr.credits?.cast?.length ?? 0) === 0 && (en.credits?.cast?.length ?? 0) > 0,
  };

  return {
    movie: mapMovie(merged),
    languageUsed: "fr+en",
    usedFallback: true,
    completed,
  };
}
