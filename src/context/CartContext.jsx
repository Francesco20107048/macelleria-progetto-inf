import { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('macelleria_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState({ visible: false, message: '' });

  // Persiste il carrello nel localStorage ad ogni modifica
  useEffect(() => {
    localStorage.setItem('macelleria_cart', JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  }, []);

  // Aggiunge un prodotto o incrementa la quantità se già presente
  const addItem = useCallback((product, quantityKg) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantityKg: parseFloat((i.quantityKg + quantityKg).toFixed(1)) }
            : i
        );
      }
      return [...prev, { product, quantityKg }];
    });
    showToast(`${product.name} aggiunto al carrello`);
  }, [showToast]);

  // Rimuove un prodotto dal carrello
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  // Aggiorna la quantità di un prodotto
  const updateQuantity = useCallback((productId, quantityKg) => {
    if (quantityKg < 0.5) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantityKg: parseFloat(quantityKg.toFixed(1)) }
          : i
      )
    );
  }, []);

  // Svuota il carrello
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantityKg, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price_per_kg * i.quantityKg,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems: parseFloat(totalItems.toFixed(1)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        itemCount: items.length,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
