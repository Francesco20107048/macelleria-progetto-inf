import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => navigate(`/catalogo?category=${category.slug}`)}
      className="relative h-[220px] rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Immagine di sfondo */}
      {!imgError ? (
        <img
          src={category.image_url}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-700" />
      )}

      {/* Overlay scuro con transizione al hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/50 transition-all duration-300" />

      {/* Nome categoria in basso */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className="text-white font-serif text-xl drop-shadow-lg">
          {category.name}
        </span>
      </div>
    </div>
  );
}
