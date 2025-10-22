import { useParams } from "react-router-dom";
export default function MoviePage() {
  const { id } = useParams();
  return (
    <>
      <h1 className="mt-3">??? Fiche film</h1>
      <p>ID : <strong>{id}</strong></p>
    </>
  );
}
