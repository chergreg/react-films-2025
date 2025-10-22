import { useParams } from "react-router-dom";
export default function CategoryPage() {
  const { idCat } = useParams();
  return (
    <>
      <h1 className="mt-3">??? Cat�gorie</h1>
      <p>ID cat�gorie : <strong>{idCat}</strong></p>
    </>
  );
}
