import { useSearchParams } from "react-router-dom";
export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  return (
    <>
      <h1 className="mt-3">?? Recherche</h1>
      <p>Query : <strong>{q || "(vide)"}</strong></p>
    </>
  );
}
