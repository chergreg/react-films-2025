import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Alert, Badge, Container, Row, Col, Card, Placeholder } from "react-bootstrap";
import { getMovieFrThenCompleteWithEn } from "../api/tmdb";
import { formatDate } from "../utils/utils";
import type { Movie } from "..//types/domains";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; movie: Movie; languageUsed: string; usedFallback: boolean; completedFields: string[] };

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setState({ status: "loading" });
    getMovieFrThenCompleteWithEn(id, "fr-CA")
      .then((res) => mounted && setState({ status: "success", ...res }))
      .catch((e) => mounted && setState({ status: "error", error: String(e) }));
    return () => { mounted = false; };
  }, [id]);

  if (state.status !== "success") {
    if (state.status === "error") return <Alert variant="danger" className="mt-3">Erreur: {state.error}</Alert>;
    return <Skeleton/>;
  }

  const { movie, languageUsed, usedFallback, completedFields } = state;

  return (
    <Container className="mt-3">
      {/* Backdrop */}
      {movie.backdropUrl && (
        <div
          style={{
            backgroundImage: `url(${movie.backdropUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 12,
            minHeight: 200,
            filter: "brightness(0.75)",
          }}
        />
      )}

      <Row className="mt-3">
        {/* Poster */}
        <Col md={3} className="mb-3">
          <Card>
            {movie.posterUrl ? (
              <Card.Img src={movie.posterUrl} alt={movie.title} />
            ) : (
              <div style={{ aspectRatio: "2/3" }} className="bg-light d-flex align-items-center justify-content-center">
                <span className="text-muted">Aucune affiche</span>
              </div>
            )}
          </Card>
        </Col>

        {/* Infos */}
        <Col md={9}>
          <h1 className="h3">
            {movie.title} {movie.year && <span className="text-muted">({movie.year})</span>}
          </h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <div className="text-muted mb-1"><em>Titre original :</em> {movie.originalTitle}</div>
          )}
          {movie.tagline && <div className="mb-2"><em>“{movie.tagline}”</em></div>}

          <div className="d-flex align-items-center gap-2 mb-3">
            {movie.releaseDate && <Badge bg="secondary">{formatDate(movie.releaseDate)}</Badge>}
            {usedFallback && <Badge bg="warning" text="dark">FR complété par EN</Badge>}
            {!usedFallback && (languageUsed === "fr-CA" || languageUsed === "fr-FR") && <Badge bg="info">FR</Badge>}
          </div>

          {/* Catégories cliquables */}
          <div className="mb-3 d-flex flex-wrap gap-2">
            {movie.genres.map(g => (
              <Badge as={Link} to={`/categorie/${g.id}`} key={g.id} bg="dark" style={{ textDecoration: "none" }}>
                {g.name}
              </Badge>
            ))}
          </div>

          <h2 className="h5">Synopsis</h2>
          <p>{movie.overview || <span className="text-muted">Aucun synopsis disponible.</span>}</p>

          <h2 className="h6 mt-3">Évaluation des utilisateurs</h2>
          <p className="mb-0">{typeof movie.rating === "number" ? `${Math.round(movie.rating * 10) / 10} / 10` : <span className="text-muted">Non évalué</span>}</p>

          {/* Info pédagogique sur les champs complétés */}
          {usedFallback && completedFields.length > 0 && (
            <p className="text-muted mt-3">
              Champs complétés depuis EN : {completedFields.join(", ")}.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

function Skeleton() {
  return (
    <Container className="mt-3">
      <Placeholder as="div" animation="glow">
        <Placeholder xs={12} style={{ height: 180, borderRadius: 12 }} />
      </Placeholder>
      <Row className="mt-3">
        <Col md={3}>
          <Placeholder as={Card} animation="glow" className="p-0">
            <div style={{ aspectRatio: "2/3" }} className="w-100 bg-light" />
          </Placeholder>
        </Col>
        <Col md={9}>
          <Placeholder as="h1" animation="glow"><Placeholder xs={6} /></Placeholder>
          <Placeholder as="p" animation="glow"><Placeholder xs={8} /></Placeholder>
          <Placeholder as="p" animation="glow"><Placeholder xs={10} /></Placeholder>
        </Col>
      </Row>
    </Container>
  );
}
