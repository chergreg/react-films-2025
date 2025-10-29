import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import CategoryPage from "./pages/CategoryPage";
import ActorPage from "./pages/ActorPage";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">React Films 2025</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Accueil</Nav.Link>

              {/* --- FILMS --- */}
              <NavDropdown title="Films" id="nav-films">
                <NavDropdown.Item as={Link} to="/film/10647">Film #10647</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/film/2">Film #2</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/film/3">Film #3</NavDropdown.Item>
              </NavDropdown>

              {/* --- CATEGORIES --- */}
              <NavDropdown title="Catégories" id="nav-categories">
                <NavDropdown.Item as={Link} to="/categorie/28">Action</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/categorie/35">Comédie</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/categorie/12">Aventure</NavDropdown.Item>
              </NavDropdown>

              {/* --- ACTEURS --- */}
              <NavDropdown title="Acteurs" id="nav-acteurs">
                <NavDropdown.Item as={Link} to="/acteur/1">Acteur #1</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/acteur/2">Acteur #2</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/acteur/3">Acteur #3</NavDropdown.Item>
              </NavDropdown>

              <Nav.Link as={Link} to="/search">Recherche</Nav.Link>
              <Nav.Link as={Link} to="/a-propos">À propos</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="container py-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/film/:id" element={<MoviePage />} />
          <Route path="/categorie/:idCat" element={<CategoryPage />} />
          <Route path="/acteur/:id" element={<ActorPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="*" element={<h1>404 — Page introuvable</h1>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
