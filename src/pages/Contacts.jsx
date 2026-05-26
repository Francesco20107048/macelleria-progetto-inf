import { useState } from 'react';
import { sendContact } from '../api/api.js';

const MOTIVI = [
  'Informazioni sui prodotti',
  'Ordini e prenotazioni',
  'Reclami e assistenza',
  'Collaborazioni',
  'Altro',
];

function InfoRow({ icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="text-bordeaux flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">{label}</p>
        <p className="text-sm text-[#1A1A1A] dark:text-[#F0EDE8] font-medium">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} className="block hover:opacity-80 transition-opacity">{content}</a>;
  return <div>{content}</div>;
}

function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11 19.79 19.79 0 0 1 1 2.38 2 2 0 0 1 3 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function MailIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function MapIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

const ORARI = [
  { giorno: 'Lunedi', orario: '08:00 – 13:30 / 16:30 – 20:00' },
  { giorno: 'Martedi – Venerdi', orario: '08:00 – 13:30 / 16:30 – 20:00' },
  { giorno: 'Sabato', orario: '08:00 – 13:30' },
  { giorno: 'Domenica', orario: 'Chiuso' },
];

export default function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', motivo: MOTIVI[0], message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
    if (!form.email.trim()) e.email = "L'email è obbligatoria";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Formato email non valido';
    if (!form.message.trim()) e.message = 'Il messaggio è obbligatorio';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    try {
      await sendContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `[${form.motivo}] ${form.message}`,
      });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', motivo: MOTIVI[0], message: '' });
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Intestazione */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-bordeaux font-normal mb-2">Contatti</h1>
        <div className="w-16 h-0.5 bg-gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Informazioni di contatto */}
        <div>
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-6">Dove siamo</h2>

          <div className="space-y-5 mb-8">
            <InfoRow
              icon={<MapIcon />}
              label="Indirizzo"
              value="Via San Michele, 14 – 80100 Napoli (NA)"
            />
            <InfoRow
              icon={<PhoneIcon />}
              label="Telefono"
              value="+39 081 123 4567"
              href="tel:+390811234567"
            />
            <InfoRow
              icon={<MailIcon />}
              label="Email"
              value="info@ilmacellaiodisanmichele.it"
              href="mailto:info@ilmacellaiodisanmichele.it"
            />
          </div>

          {/* Orari */}
          <div className="bg-bordeaux/5 dark:bg-bordeaux/10 border border-bordeaux/20 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-bordeaux"><ClockIcon /></span>
              <h3 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] text-sm">Orari di apertura</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {ORARI.map(({ giorno, orario }) => (
                  <tr key={giorno} className="border-b border-bordeaux/10 last:border-0">
                    <td className="py-2 text-[#555555] dark:text-[#A0A0A0] w-44">{giorno}</td>
                    <td className="py-2 text-[#1A1A1A] dark:text-[#F0EDE8] font-medium">{orario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mappa placeholder */}
          <div className="rounded-xl overflow-hidden border border-edge dark:border-[#333333] bg-gray-100 dark:bg-[#2A2A2A] h-52 flex flex-col items-center justify-center gap-2">
            <span className="text-bordeaux"><MapIcon /></span>
            <p className="text-[#888888] dark:text-[#777777] text-sm">Via San Michele, 14 – Napoli</p>
            <p className="text-xs text-[#888888] dark:text-[#666666]">Mappa non disponibile in versione dimostrativa</p>
          </div>
        </div>

        {/* Modulo di contatto */}
        <div>
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-6">Inviaci un messaggio</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-5">
              <p className="font-medium text-sm mb-0.5">Messaggio inviato!</p>
              <p className="text-xs">Ti risponderemo il prima possibile all'email indicata.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.name ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                  placeholder="Mario Rossi"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Telefono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className="w-full border border-edge dark:border-[#444444] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-bordeaux transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="+39 333 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.email ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                placeholder="mario@email.it"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Motivo del contatto</label>
              <select
                value={form.motivo}
                onChange={set('motivo')}
                className="w-full border border-edge dark:border-[#444444] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-bordeaux transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8]"
              >
                {MOTIVI.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Messaggio *</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={set('message')}
                className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.message ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                placeholder="Scrivi qui il tuo messaggio..."
              />
              {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
            </div>

            {errors.api && <p className="text-red-600 text-sm">{errors.api}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-bordeaux text-white rounded-md font-medium hover:bg-bordeaux-dark disabled:opacity-50 active:scale-95 transition-all text-sm"
            >
              {sending ? 'Invio in corso...' : 'Invia messaggio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
