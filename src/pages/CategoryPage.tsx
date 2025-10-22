import { useParams } from "react-router-dom";
export default function CategoryPage() {
  const { idCat } = useParams();
  return (
    <>
      <h1 className="mt-3">??? Catégorie</h1>
      <p>ID catégorie : <strong>{idCat}</strong></p>
    </>
  );
}
