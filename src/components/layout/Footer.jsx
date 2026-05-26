import { Link } from 'react-router-dom';

const ORARI = [
  { giorno: 'Lunedi', orario: '08:00 – 13:30 / 16:30 – 20:00' },
  { giorno: 'Martedi – Venerdi', orario: '08:00 – 13:30 / 16:30 – 20:00' },
  { giorno: 'Sabato', orario: '08:00 – 13:30' },
  { giorno: 'Domenica', orario: 'Chiuso' },
];

const LINK_RAPIDI = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/recensioni', label: 'Recensioni' },
  { to: '/contatti', label: 'Contatti' },
  { to: '/carrello', label: 'Carrello' },
];

export default function Footer() {
  return (
    <footer className="bg-bordeaux-dark text-white/70">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Colonna 1 – Info negozio */}
        <div>
          <h3 className="font-serif text-white text-lg mb-4">
            Il Macellaio di San Michele
          </h3>
          <address className="not-italic space-y-2 text-sm">
            <p>Via San Michele, 14</p>
            <p>80100 Napoli (NA)</p>
            <p className="mt-3">
              <a href="tel:+390811234567" className="hover:text-white transition-colors">
                +39 081 123 4567
              </a>
            </p>
            <p>
              <a
                href="mailto:info@ilmacellaiodisanmichele.it"
                className="hover:text-white transition-colors break-all"
              >
                info@ilmacellaiodisanmichele.it
              </a>
            </p>
          </address>
        </div>

        {/* Colonna 2 – Link rapidi */}
        <div>
          <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-xs">
            Link rapidi
          </h4>
          <ul className="space-y-2 text-sm">
            {LINK_RAPIDI.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonna 3 – Orari */}
        <div>
          <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-xs">
            Orari di apertura
          </h4>
          <table className="text-sm w-full">
            <tbody>
              {ORARI.map(({ giorno, orario }) => (
                <tr key={giorno} className="border-b border-white/10 last:border-0">
                  <td className="py-1.5 pr-3 text-white/50 whitespace-nowrap">{giorno}</td>
                  <td className="py-1.5 text-right">{orario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>
            &copy; {new Date().getFullYear()} Il Macellaio di San Michele – Tutti i diritti riservati
          </p>
          <p>Progetto scolastico – Sito dimostrativo</p>
        </div>
      </div>
    </footer>
  );
}
