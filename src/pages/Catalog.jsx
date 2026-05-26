import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories } from '../api/api.js';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ui/ProductCard.jsx';

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome A-Z' },
  { value: 'price_asc', label: 'Prezzo crescente' },
  { value: 'price_desc', label: 'Prezzo decrescente' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');

  const { products, loading, error } = useProducts(
    categoryParam || undefined,
    searchParam || undefined,
    undefined
  );

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Conteggio prodotti per categoria (dai dati caricati senza filtro categoria)
  const { products: allProducts } = useProducts(undefined, undefined, undefined);
  const countByCategory = useMemo(() => {
    const map = {};
    for (const p of allProducts) {
      map[p.category_slug] = (map[p.category_slug] || 0) + 1;
    }
    return map;
  }, [allProducts]);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    if (sortBy === 'price_asc') return copy.sort((a, b) => a.price_per_kg - b.price_per_kg);
    if (sortBy === 'price_desc') return copy.sort((a, b) => b.price_per_kg - a.price_per_kg);
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, sortBy]);

  const handleCategory = (slug) => {
    const params = {};
    if (slug) params.category = slug;
    if (searchParam) params.search = searchParam;
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Titolo pagina */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-bordeaux font-normal">
          {searchParam ? `Risultati per "${searchParam}"` : 'Il nostro catalogo'}
        </h1>
        <div className="w-16 h-0.5 bg-gold mt-3" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtri */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5 sticky top-24">
            <h3 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4 text-sm uppercase tracking-wider">
              Categorie
            </h3>
            <ul className="space-y-1">
              <li>
                <label className="flex items-center justify-between cursor-pointer group py-1.5">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="categoria"
                      checked={categoryParam === ''}
                      onChange={() => handleCategory('')}
                      className="accent-bordeaux"
                    />
                    <span className="text-sm text-[#555555] dark:text-[#A0A0A0] group-hover:text-bordeaux transition-colors">
                      Tutte le categorie
                    </span>
                  </div>
                  <span className="text-xs text-[#888888] dark:text-[#777777] bg-gray-100 dark:bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                    {allProducts.length}
                  </span>
                </label>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <label className="flex items-center justify-between cursor-pointer group py-1.5">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="categoria"
                        checked={categoryParam === cat.slug}
                        onChange={() => handleCategory(cat.slug)}
                        className="accent-bordeaux"
                      />
                      <span className="text-sm text-[#555555] dark:text-[#A0A0A0] group-hover:text-bordeaux transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-[#888888] dark:text-[#777777] bg-gray-100 dark:bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                      {countByCategory[cat.slug] || 0}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Area prodotti */}
        <div className="flex-1 min-w-0">
          {/* Barra risultati + ordinamento */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-[#555555] dark:text-[#A0A0A0]">
              {loading ? 'Caricamento...' : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}`}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#555555] dark:text-[#A0A0A0]">Ordina per:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-edge dark:border-[#444444] rounded-md px-3 py-1.5 bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] focus:outline-none focus:border-bordeaux"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro categoria mobile */}
          <div className="md:hidden mb-4 overflow-x-auto flex gap-2 pb-1">
            <button
              onClick={() => handleCategory('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                categoryParam === ''
                  ? 'bg-bordeaux text-white border-bordeaux'
                  : 'border-edge dark:border-[#444444] text-[#555555] dark:text-[#A0A0A0] hover:border-bordeaux'
              }`}
            >
              Tutte
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.slug)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  categoryParam === cat.slug
                    ? 'bg-bordeaux text-white border-bordeaux'
                    : 'border-edge dark:border-[#444444] text-[#555555] dark:text-[#A0A0A0] hover:border-bordeaux'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Griglia prodotti */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-[#2A2A2A] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              Errore nel caricamento: {error}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#888888] dark:text-[#777777] text-lg mb-2">Nessun prodotto trovato</p>
              <p className="text-[#888888] dark:text-[#777777] text-sm">
                Prova a modificare i filtri o la ricerca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
