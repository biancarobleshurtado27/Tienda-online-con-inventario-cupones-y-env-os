import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getToyImageUrl } from '../utils/toyImages.js';

const CartContext = createContext(null);

const STORAGE_KEY = 'mundo_juguete_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando carrito de localStorage:', e);
    }
    return [];
  });

  // Sincronizar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return { success: false, message: 'Producto no válido' };

    const stockDisponible = Number(product.stock) || 0;
    if (stockDisponible <= 0) {
      return { success: false, message: 'El producto está agotado.' };
    }

    let message = '¡Juguete añadido al carrito mágico!';
    let reachedLimit = false;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);

      if (existingIndex > -1) {
        const existingItem = prevCart[existingIndex];
        const requestedTotal = existingItem.cantidad + quantity;
        const finalQuantity = Math.min(requestedTotal, stockDisponible);

        if (requestedTotal > stockDisponible) {
          reachedLimit = true;
          message = `Solo hay ${stockDisponible} unidades disponibles en inventario.`;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...existingItem,
          cantidad: finalQuantity,
          stock: stockDisponible,
          precio: Number(product.precio) || existingItem.precio,
          nombre: product.nombre || existingItem.nombre,
          categoria: product.categoria || existingItem.categoria,
          imagen: getToyImageUrl(product)
        };
        return updated;
      } else {
        const finalQuantity = Math.min(Math.max(1, quantity), stockDisponible);
        if (quantity > stockDisponible) {
          reachedLimit = true;
          message = `Solo hay ${stockDisponible} unidades disponibles en inventario.`;
        }

        return [
          ...prevCart,
          {
            id: product.id,
            nombre: product.nombre,
            precio: Number(product.precio) || 0,
            stock: stockDisponible,
            categoria: product.categoria,
            imagen: getToyImageUrl(product),
            cantidad: finalQuantity,
          }
        ];
      }
    });

    return { success: true, message, reachedLimit };
  };

  // Modificar cantidad directamente o con delta
  const updateQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === productId);
      if (!item) return prevCart;

      const targetQty = Number(newQuantity);
      if (isNaN(targetQty) || targetQty <= 0) {
        // Eliminar si es 0 o menor
        return prevCart.filter(i => i.id !== productId);
      }

      // Limitar al stock disponible
      const maxStock = Number(item.stock) || 999;
      const clamped = Math.min(targetQty, maxStock);

      return prevCart.map(i => (i.id === productId ? { ...i, cantidad: clamped } : i));
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Vaciar carrito por completo
  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error limpiando carrito de localStorage:', e);
    }
  };

  // Métricas derivadas
  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 0), 0);
  }, [cart]);

  const getItemQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.cantidad : 0;
  };

  const value = {
    cart,
    totalItems,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
