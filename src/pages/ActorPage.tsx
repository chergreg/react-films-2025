import { useParams } from "react-router-dom";
export default function ActorPage() {
  const { id } = useParams();
  return (
    <>
      <h1 className="mt-3"> Fiche acteur</h1>
      <p>ID acteur : <strong>{id}</strong></p>
    </>
  );
}
