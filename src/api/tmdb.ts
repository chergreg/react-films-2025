import axios from "axios";
import type { Movie } from "@/types/domains";
import type { MovieTMDB } from "@/types/tmdb";
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

/** Champs considérés “essentiels” pour décider d'appeler EN */
function isEssentialMissing(m?: MovieTMDB) {
  if (!m) return true;
  const missingOverview = isEmptyText(m.overview);
  const missingTagline = isEmptyText(m.tagline);
  const missingGenres = !m.genres || m.genres.length === 0;
  // On déclenche EN si l’un des essentiels manque
  return missingOverview || missingTagline || missingGenres;
}

/** Merge FR avec EN: privilégie FR, comble les trous avec EN */
function mergeMovieFRwithEN(fr: MovieTMDB, en: MovieTMDB): MovieTMDB {
  return {
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
  };
}

async function fetchMovie(id: string, language: string) {
  const { data } = await api.get<MovieTMDB>(`/movie/${id}`, { params: { language } });
  return data;
}

/**
 * getMovieFrThenCompleteWithEn
 * 1) Appel FR (fr-CA ou fr-FR)
 * 2) Si champs manquent, appel en-US et COMPLÉTION
 * 3) Map vers modèle interne Movie
 */
export async function getMovieFrThenCompleteWithEn(
  id: string,
  preferredFr: FR = "fr-CA"
): Promise<{
  movie: Movie;
  languageUsed: FR | EN | "fr+en";
  usedFallback: boolean;
  completedFields: Array<keyof MovieTMDB>;
}> {
  // 1) FR
  const fr = await fetchMovie(id, preferredFr);

  // 2) Si besoin, EN + merge
  if (!isEssentialMissing(fr)) {
    return {
      movie: mapMovie(fr),
      languageUsed: preferredFr,
      usedFallback: false,
      completedFields: [],
    };
  }

  const en = await fetchMovie(id, "en-US");
  const merged = mergeMovieFRwithEN(fr, en);

  // Lister les champs complétés pour debug/affichage pédagogique
  const completedFields: Array<keyof MovieTMDB> = [];
  if (isEmptyText(fr.overview) && !isEmptyText(en.overview)) completedFields.push("overview");
  if (isEmptyText(fr.tagline) && !isEmptyText(en.tagline)) completedFields.push("tagline");
  if ((!fr.genres || fr.genres.length === 0) && (en.genres && en.genres.length > 0)) completedFields.push("genres");

  return {
    movie: mapMovie(merged),
    languageUsed: "fr+en",     // explicite : base FR complétée par EN
    usedFallback: true,
    completedFields,
  };
}
