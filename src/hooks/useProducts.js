import { useState, useEffect } from 'react';
import { getProducts } from '../api/api.js';

export function useProducts(category, search, featured) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts({ category, search, featured })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [category, search, featured]);

  return { products, loading, error };
}
