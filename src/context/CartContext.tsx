'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface CartItem {
  product: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  image: string;
  deliveryCharge?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number; deliveryCharge?: number }) => Promise<void>;
  removeFromCart: (productId: string, selectedSize: string) => Promise<void>;
  updateQuantity: (productId: string, selectedSize: string, quantity: number) => Promise<void>;
  updateSize: (productId: string, oldSize: string, newSize: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // 1. Initial Load: from MongoDB for authenticated users, reset to empty if logged out
  useEffect(() => {
    const loadCart = async () => {
      // If user is logged out, always keep cart empty
      if (!user) {
        setCart([]);
        localStorage.removeItem('miralou_streetwear_cart');
        setIsLoaded(true);
        return;
      }

      // If user is authenticated, fetch their authentic MongoDB cart
      try {
        const res = await fetch(`${apiUrl}/cart`, {
          credentials: 'include',
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items)) {
            const dbCart: CartItem[] = data.items.map((i: any) => ({
              product: i.product?._id || i.product || '',
              title: i.title || i.product?.title || '',
              price: Number(i.price || i.product?.price || 0),
              quantity: Number(i.quantity || 1),
              selectedSize: i.selectedSize || 'EU 42',
              image: i.image || i.product?.images?.[0] || '',
            }));
            setCart(dbCart);
            localStorage.setItem('miralou_streetwear_cart', JSON.stringify(dbCart));
            setIsLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching MongoDB cart', err);
      }

      // Fallback to local storage if network blip but user is authenticated
      let localCart: CartItem[] = [];
      try {
        const saved = localStorage.getItem('miralou_streetwear_cart');
        if (saved) localCart = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local cart', e);
      }
      setCart(localCart);
      setIsLoaded(true);
    };

    loadCart();
  }, [user, apiUrl]);

  // 2. Persist local state whenever cart changes (only for authenticated user)
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem('miralou_streetwear_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('miralou_streetwear_cart');
      }
    }
  }, [cart, isLoaded, user]);

  // 3. Add to Cart (Synchronized to MongoDB for logged in users)
  const addToCart = async (
    newItem: Omit<CartItem, 'quantity'> & { quantity?: number; deliveryCharge?: number }
  ) => {
    const qty = newItem.quantity || 1;
    const itemToAdd: CartItem = {
      product: newItem.product,
      title: newItem.title,
      price: newItem.price,
      selectedSize: newItem.selectedSize || 'EU 42',
      image: newItem.image || '',
      quantity: qty,
      deliveryCharge: newItem.deliveryCharge !== undefined ? Number(newItem.deliveryCharge) : 120,
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product === itemToAdd.product && i.selectedSize === itemToAdd.selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        if (itemToAdd.deliveryCharge !== undefined) {
          updated[existingIndex].deliveryCharge = itemToAdd.deliveryCharge;
        }
        return updated;
      } else {
        return [...prev, itemToAdd];
      }
    });

    if (user) {
      try {
        await fetch(`${apiUrl}/cart`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(itemToAdd),
        });
      } catch (err) {
        console.error('Failed to sync addToCart to MongoDB', err);
      }
    }
  };

  // 4. Update Quantity (Synchronized to MongoDB)
  const updateQuantity = async (productId: string, selectedSize: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, selectedSize);
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.product === productId && i.selectedSize === selectedSize ? { ...i, quantity } : i
      )
    );

    if (user) {
      try {
        await fetch(`${apiUrl}/cart`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            product: productId,
            selectedSize,
            newQuantity: quantity,
          }),
        });
      } catch (err) {
        console.error('Failed to sync updateQuantity to MongoDB', err);
      }
    }
  };

  // 5. Update Shoe Size (Synchronized to MongoDB)
  const updateSize = async (productId: string, oldSize: string, newSize: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product === productId && i.selectedSize === oldSize ? { ...i, selectedSize: newSize } : i
      )
    );

    if (user) {
      try {
        await fetch(`${apiUrl}/cart`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            product: productId,
            selectedSize: oldSize,
            newSize,
          }),
        });
      } catch (err) {
        console.error('Failed to sync updateSize to MongoDB', err);
      }
    }
  };

  // 6. Remove from Cart (Synchronized to MongoDB)
  const removeFromCart = async (productId: string, selectedSize: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product === productId && i.selectedSize === selectedSize))
    );

    if (user) {
      try {
        await fetch(`${apiUrl}/cart/item`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ productId, selectedSize }),
        });
      } catch (err) {
        console.error('Failed to sync removeFromCart to MongoDB', err);
      }
    }
  };

  // 7. Clear Cart (Synchronized to MongoDB)
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('miralou_streetwear_cart');

    if (user) {
      try {
        await fetch(`${apiUrl}/cart`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
      } catch (err) {
        console.error('Failed to clear MongoDB cart', err);
      }
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
