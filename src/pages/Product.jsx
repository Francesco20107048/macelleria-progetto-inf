import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getProductReviews, postProductReview, getProducts } from '../api/api.js';
import { useCart } from '../hooks/useCart.js';
import { AuthContext } from '../context/AuthContext.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import Badge from '../components/ui/Badge.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function KnifeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2 l18 18 M8.5 8.5 Q4 12 4 17 a3 3 0 0 0 6 0 V8.5"/>
    </svg>
  );
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, setShowLoginModal } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const [quantity, setQuantity] = useState(0.5);
  const [added, setAdded] = useState(false);

  // Stato form recensione
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSending, setReviewSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    setQuantity(0.5);

    getProduct(id)
      .then((p) => {
        setProduct(p);
        return Promise.all([
          getProductReviews(id),
          getProducts({ category: p.category_slug }),
        ]);
      })
      .then(([rev, rel]) => {
        setReviews(rev);
        setRelated(rel.filter((p) => p.id !== Number(id)).slice(0, 4));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDecrement = () => {
    if (quantity > 0.5) setQuantity((q) => parseFloat((q - 0.5).toFixed(1)));
  };

  const handleIncrement = () => {
    setQuantity((q) => parseFloat((q + 0.5).toFixed(1)));
  };

  const handleAdd = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.author.trim()) return setReviewError('Il nome è obbligatorio');
    if (!reviewForm.rating) return setReviewError('Seleziona una valutazione');
    if (!reviewForm.comment.trim()) return setReviewError('Il commento è obbligatorio');

    setReviewError('');
    setReviewSending(true);
    try {
      const nuova = await postProductReview(id, reviewForm);
      setReviews((prev) => [nuova, ...prev]);
      setReviewForm({ author: '', rating: 0, comment: '' });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-100 dark:bg-[#2A2A2A] rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 dark:bg-[#2A2A2A] rounded animate-pulse w-1/3" />
            <div className="h-8 bg-gray-100 dark:bg-[#2A2A2A] rounded animate-pulse w-2/3" />
            <div className="h-4 bg-gray-100 dark:bg-[#2A2A2A] rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#888888] dark:text-[#777777] text-lg mb-4">Prodotto non trovato</p>
        <Link to="/catalogo" className="text-bordeaux underline text-sm">
          Torna al catalogo
        </Link>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#888888] dark:text-[#777777] mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-bordeaux transition-colors">Home</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-bordeaux transition-colors">Catalogo</Link>
        <span>/</span>
        {product.category_name && (
          <>
            <Link
              to={`/catalogo?category=${product.category_slug}`}
              className="hover:text-bordeaux transition-colors"
            >
              {product.category_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#1A1A1A] dark:text-[#F0EDE8]">{product.name}</span>
      </nav>

      {/* Dettaglio prodotto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Immagine */}
        <div className="relative h-96 rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-[#2A2A2A]">
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

        {/* Info prodotto */}
        <div>
          {product.category_name && (
            <Badge className="mb-3">{product.category_name}</Badge>
          )}

          <h1 className="font-serif text-3xl text-[#1A1A1A] dark:text-[#F0EDE8] font-normal mb-3">
            {product.name}
          </h1>

          {/* Stelle */}
          <div className="mb-4">
            <StarRating
              rating={parseFloat(avgRating.toFixed(1))}
              count={reviews.length}
            />
          </div>

          {/* Prezzo */}
          <p className="text-bordeaux font-bold text-3xl mb-5">
            {product.price_per_kg.toLocaleString('it-IT', {
              style: 'currency',
              currency: 'EUR',
            })}{' '}
            / kg
          </p>

          {/* Descrizione */}
          <p className="text-[#555555] dark:text-[#A0A0A0] text-sm leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Provenienza e taglio */}
          <div className="flex flex-col gap-2 mb-5">
            {product.origin && (
              <div className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#A0A0A0]">
                <span className="text-bordeaux"><PinIcon /></span>
                <span><strong className="text-[#1A1A1A] dark:text-[#F0EDE8]">Provenienza:</strong> {product.origin}</span>
              </div>
            )}
            {product.cut_type && (
              <div className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#A0A0A0]">
                <span className="text-bordeaux"><KnifeIcon /></span>
                <span><strong className="text-[#1A1A1A] dark:text-[#F0EDE8]">Taglio:</strong> {product.cut_type}</span>
              </div>
            )}
          </div>

          {/* Consiglio di cottura */}
          {product.cooking_tip && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-6">
              <p className="text-xs font-medium text-[#7A5C1A] uppercase tracking-wide mb-1">
                Consiglio di cottura
              </p>
              <p className="text-sm text-[#555555] dark:text-[#A0A0A0] leading-relaxed">{product.cooking_tip}</p>
            </div>
          )}

          {/* Selettore quantita */}
          <div className="mb-3">
            <p className="text-sm text-[#555555] dark:text-[#A0A0A0] mb-2">Quantita (kg)</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 0.5}
                className="w-9 h-9 rounded-md border border-edge dark:border-[#444444] flex items-center justify-center text-lg font-medium text-[#555555] dark:text-[#A0A0A0] hover:border-bordeaux hover:text-bordeaux disabled:opacity-40 transition-colors"
              >
                -
              </button>
              <span className="w-16 text-center font-medium text-lg dark:text-[#F0EDE8]">
                {quantity.toFixed(1)} kg
              </span>
              <button
                onClick={handleIncrement}
                className="w-9 h-9 rounded-md border border-edge dark:border-[#444444] flex items-center justify-center text-lg font-medium text-[#555555] dark:text-[#A0A0A0] hover:border-bordeaux hover:text-bordeaux transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Totale live */}
          <p className="text-sm text-[#888888] dark:text-[#777777] mb-5">
            Totale:{' '}
            <strong className="text-bordeaux">
              {(product.price_per_kg * quantity).toLocaleString('it-IT', {
                style: 'currency',
                currency: 'EUR',
              })}
            </strong>
          </p>

          <button
            onClick={handleAdd}
            className={`w-full py-3 rounded-md font-medium transition-all duration-150 ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-bordeaux text-white hover:bg-bordeaux-dark active:scale-95'
            }`}
          >
            {added ? 'Aggiunto al carrello!' : user ? 'Aggiungi al carrello' : 'Accedi per acquistare'}
          </button>
        </div>
      </div>

      {/* Sezione recensioni */}
      <div className="border-t border-edge dark:border-[#333333] pt-12 mb-16">
        <h2 className="font-serif text-2xl text-bordeaux mb-2">
          Recensioni ({reviews.length})
        </h2>
        <div className="w-12 h-0.5 bg-gold mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Lista recensioni */}
          <div>
            {reviews.length === 0 ? (
              <p className="text-[#888888] dark:text-[#777777] text-sm py-6">
                Nessuna recensione ancora. Sii il primo a recensire questo prodotto!
              </p>
            ) : (
              <div className="space-y-5">
                {avgRating > 0 && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333]">
                    <span className="font-serif text-4xl text-bordeaux">
                      {avgRating.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={parseFloat(avgRating.toFixed(1))} />
                      <p className="text-xs text-[#888888] dark:text-[#777777] mt-1">
                        Media su {reviews.length} recension{reviews.length !== 1 ? 'i' : 'e'}
                      </p>
                    </div>
                  </div>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-[#1A1A1A] dark:text-[#F0EDE8]">{r.author}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <span className="text-xs text-[#888888] dark:text-[#777777]">
                        {new Date(r.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <p className="text-sm text-[#555555] dark:text-[#A0A0A0] leading-relaxed mt-2">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form nuova recensione */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4">Lascia una recensione</h3>
            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Nome</label>
                <input
                  type="text"
                  value={reviewForm.author}
                  onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                  className="w-full border border-edge dark:border-[#444444] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-bordeaux transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-2">Valutazione</label>
                <StarRating
                  rating={reviewForm.rating}
                  interactive
                  onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Commento</label>
                <textarea
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-edge dark:border-[#444444] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-bordeaux transition-colors resize-none bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="Condividi la tua esperienza con questo prodotto..."
                />
              </div>
              {reviewError && (
                <p className="text-red-600 text-sm">{reviewError}</p>
              )}
              <button
                type="submit"
                disabled={reviewSending}
                className="w-full py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark disabled:opacity-50 transition-colors"
              >
                {reviewSending ? 'Invio in corso...' : 'Pubblica recensione'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Prodotti correlati */}
      {related.length > 0 && (
        <div className="border-t border-edge dark:border-[#333333] pt-12">
          <h2 className="font-serif text-2xl text-bordeaux mb-2">Prodotti correlati</h2>
          <div className="w-12 h-0.5 bg-gold mb-8" />
          <div className="overflow-x-auto">
            <div className="flex gap-5 pb-2" style={{ minWidth: 'max-content' }}>
              {related.map((p) => (
                <div key={p.id} className="w-56 flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
