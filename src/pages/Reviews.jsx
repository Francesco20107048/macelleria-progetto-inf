import { useState, useEffect } from 'react';
import { getShopReviews, postShopReview } from '../api/api.js';
import StarRating from '../components/ui/StarRating.jsx';

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#888888] dark:text-[#777777] w-4 text-right">{stars}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1">
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
      </svg>
      <div className="flex-1 bg-gray-200 dark:bg-[#333333] rounded-full h-2">
        <div
          className="bg-gold h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[#888888] dark:text-[#777777] w-4">{count}</span>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ author: '', rating: 0, comment: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getShopReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  const validate = () => {
    const e = {};
    if (!form.author.trim()) e.author = 'Il nome è obbligatorio';
    if (!form.rating) e.rating = 'Seleziona una valutazione';
    if (!form.comment.trim()) e.comment = 'Il commento è obbligatorio';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setSending(true);
    try {
      const nuova = await postShopReview(form);
      setReviews((prev) => [nuova, ...prev]);
      setForm({ author: '', rating: 0, comment: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-bordeaux py-12 text-center">
        <h1 className="font-serif text-4xl text-white font-normal mb-2">
          Recensioni
        </h1>
        <p className="text-white/70 text-sm">
          Le opinioni autentiche dei nostri clienti
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Statistiche */}
        {!loading && reviews.length > 0 && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-edge dark:border-[#333333] p-6 mb-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="text-center flex-shrink-0">
              <p className="font-serif text-6xl text-bordeaux">
                {avgRating.toFixed(1)}
              </p>
              <StarRating rating={parseFloat(avgRating.toFixed(1))} />
              <p className="text-xs text-[#888888] dark:text-[#777777] mt-1">
                {reviews.length} recension{reviews.length !== 1 ? 'i' : 'e'}
              </p>
            </div>
            <div className="flex-1 w-full space-y-2">
              {distribution.map(({ stars, count }) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={count}
                  total={reviews.length}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Griglia recensioni */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-100 dark:bg-[#2A2A2A] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-[#888888] dark:text-[#777777] text-center py-10">
                Nessuna recensione ancora. Sii il primo!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-[#1A1A1A] dark:text-[#F0EDE8]">{r.author}</p>
                      <span className="text-xs text-[#888888] dark:text-[#777777] flex-shrink-0 ml-2">
                        {new Date(r.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-[#555555] dark:text-[#A0A0A0] leading-relaxed mt-3">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form nuova recensione */}
          <div>
            <h2 className="font-serif text-xl text-bordeaux font-normal mb-4">
              Lascia una recensione
            </h2>
            <div className="w-10 h-0.5 bg-gold mb-5" />

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                Grazie per la tua recensione! E' stata pubblicata con successo.
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.author ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'
                  }`}
                  placeholder="Il tuo nome"
                />
                {errors.author && <p className="text-red-600 text-xs mt-1">{errors.author}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-2">
                  Valutazione *
                </label>
                <StarRating
                  rating={form.rating}
                  interactive
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                />
                {errors.rating && <p className="text-red-600 text-xs mt-1">{errors.rating}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">
                  Commento *
                </label>
                <textarea
                  rows={5}
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors resize-none bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${
                    errors.comment ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'
                  }`}
                  placeholder="Racconta la tua esperienza con la nostra macelleria..."
                />
                {errors.comment && <p className="text-red-600 text-xs mt-1">{errors.comment}</p>}
              </div>

              {errors.api && <p className="text-red-600 text-sm">{errors.api}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark disabled:opacity-50 transition-colors"
              >
                {sending ? 'Invio in corso...' : 'Pubblica recensione'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
