import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import Badge from './Badge.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user, setShowLoginModal } = useContext(AuthContext);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    // Richiede autenticazione prima di aggiungere al carrello
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    addItem(product, 0.5);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      <Link to={`/prodotto/${product.id}`} className="block">
        <div className="relative h-48 bg-gray-100 dark:bg-[#2A2A2A]">
          {!imgError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-gray-400 text-sm">
              {product.name}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          {product.category_name && <Badge className="mb-2">{product.category_name}</Badge>}
          <Link to={`/prodotto/${product.id}`}>
            <h3 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] hover:text-bordeaux transition-colors mt-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="mt-1 mb-3">
          <StarRating rating={0} />
        </div>
        <div className="mt-auto">
          <p className="text-bordeaux font-bold text-lg mb-3">
            {product.price_per_kg.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })} / kg
          </p>
          <button
            onClick={handleAdd}
            className={`w-full py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              added ? 'bg-green-600 text-white' : 'bg-bordeaux text-white hover:bg-bordeaux-dark active:scale-95'
            }`}
          >
            {added ? 'Aggiunto!' : user ? 'Aggiungi al carrello' : 'Accedi per acquistare'}
          </button>
        </div>
      </div>
    </div>
  );
}
