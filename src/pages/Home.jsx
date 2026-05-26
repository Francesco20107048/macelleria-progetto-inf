import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts, getShopReviews } from '../api/api.js';
import CategoryCard from '../components/ui/CategoryCard.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import StarRating from '../components/ui/StarRating.jsx';

const HERO_URL =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop&q=80';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-3xl text-bordeaux font-normal mb-2">{title}</h2>
      {subtitle && <p className="text-[#555555] dark:text-[#A0A0A0] text-sm">{subtitle}</p>}
      <div className="w-16 h-0.5 bg-gold mt-3" />
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getProducts({ featured: true }).then(setFeatured).catch(console.error);
    getShopReviews()
      .then((data) => setShopReviews(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-[550px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(74,10,18,0.65)' }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-normal mb-4 leading-tight">
            Il Macellaio di San Michele
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Carne fresca di prima qualita, tagliata a mano ogni giorno secondo l'antica tradizione napoletana
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/catalogo"
              className="px-7 py-3 bg-gold text-white rounded-md font-medium hover:bg-gold/90 transition-colors"
            >
              Scopri il catalogo
            </Link>
            <Link
              to="/contatti"
              className="px-7 py-3 bg-transparent border border-white text-white rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </section>

      {/* Categorie */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionHeader
          title="Le nostre categorie"
          subtitle="Scegli il tipo di carne che preferisci tra le nostre selezioni"
        />
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[220px] bg-gray-200 dark:bg-[#2A2A2A] rounded-xl animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* Prodotti in evidenza */}
      <section className="bg-white dark:bg-[#161616] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="I nostri migliori tagli"
            subtitle="Selezionati con cura tra i prodotti piu apprezzati dalla nostra clientela"
          />
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-[#2A2A2A] rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-bordeaux text-bordeaux rounded-md hover:bg-bordeaux hover:text-white transition-colors text-sm font-medium"
            >
              Vedi tutto il catalogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Anteprima recensioni */}
      <section className="py-16 bg-bordeaux/5 dark:bg-bordeaux/10">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="Cosa dicono i nostri clienti"
            subtitle="Le opinioni di chi sceglie ogni giorno la nostra macelleria"
          />
          {shopReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {shopReviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-[#1E1E1E] rounded-lg p-5 shadow-sm">
                  <StarRating rating={review.rating} />
                  <p className="text-[#555555] dark:text-[#A0A0A0] text-sm mt-3 leading-relaxed line-clamp-4">
                    {review.comment}
                  </p>
                  <p className="text-bordeaux font-medium text-sm mt-4">{review.author}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 dark:bg-[#2A2A2A] rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          <div className="text-center">
            <Link
              to="/recensioni"
              className="text-bordeaux font-medium text-sm hover:underline"
            >
              Leggi tutte le recensioni
            </Link>
          </div>
        </div>
      </section>

      {/* Breve presentazione */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader title="La nostra storia" />
            <p className="text-[#555555] dark:text-[#A0A0A0] leading-relaxed mb-4">
              La macelleria Il Macellaio di San Michele nasce nel cuore di Napoli con un'unica
              missione: portare sulla vostra tavola la carne di qualita piu alta, selezionata
              direttamente dagli allevamenti italiani certificati.
            </p>
            <p className="text-[#555555] dark:text-[#A0A0A0] leading-relaxed">
              Ogni giorno riceviamo carni fresche che vengono tagliate a mano con la maestria
              tramandata di generazione in generazione. Il rispetto per la tradizione e la passione
              per la qualita sono i valori che ci guidano da sempre.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { numero: '20+', label: 'Anni di esperienza' },
              { numero: '200+', label: 'Clienti soddisfatti al giorno' },
              { numero: '20', label: 'Tagli disponibili' },
              { numero: '100%', label: 'Carne italiana' },
            ].map(({ numero, label }) => (
              <div key={label} className="bg-bordeaux rounded-lg p-5 text-center text-white">
                <p className="font-serif text-3xl mb-1">{numero}</p>
                <p className="text-white/70 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
