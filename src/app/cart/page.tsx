'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldAlert, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, updateSize, removeFromCart, totalAmount, clearCart } = useCart();
  const [productCharges, setProductCharges] = useState<Record<string, number>>({});
  const [globalDeliveryCharge, setGlobalDeliveryCharge] = useState(120);

  useEffect(() => {
    const fetchDeliveryInfo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const [settingsRes, prodsRes] = await Promise.all([
          fetch(`${apiUrl}/settings`),
          fetch(`${apiUrl}/products`),
        ]);

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData?.deliveryCharge !== undefined) {
            setGlobalDeliveryCharge(Number(sData.deliveryCharge));
          }
        }

        if (prodsRes.ok) {
          const prods = await prodsRes.json();
          const charges: Record<string, number> = {};
          if (Array.isArray(prods)) {
            prods.forEach((p: any) => {
              charges[p._id || p.id] =
                p.deliveryCharge !== undefined ? Number(p.deliveryCharge) : 120;
            });
          }
          setProductCharges(charges);
        }
      } catch (e) {
        // Fallback default
      }
    };
    fetchDeliveryInfo();
  }, []);

  const getItemDeliveryCharge = (item: any) => {
    const pId = item.product || item._id || item.id;
    if (productCharges[pId] !== undefined) {
      return productCharges[pId];
    }
    if (item.deliveryCharge !== undefined) {
      return Number(item.deliveryCharge);
    }
    return globalDeliveryCharge;
  };

  // Sum delivery charges for ALL items in the cart (each product adds its own charge)
  const shippingCost =
    cart.length === 0
      ? 0
      : cart.reduce((total, item) => total + getItemDeliveryCharge(item), 0);

  const grandTotal = totalAmount + shippingCost;

  const handleProceedCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout&notice=login_required');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex p-6 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black uppercase text-white tracking-tight">YOUR BAG IS EMPTY</h1>
        <p className="text-neutral-400 text-sm max-w-md mx-auto">
          {!user
            ? 'Sign in to access your saved cart items from MongoDB, or explore the archive.'
            : "You haven't selected any streetwear drops yet. Explore the archive to find your kicks."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {!user && (
            <Link
              href="/login?redirect=/cart"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold uppercase tracking-widest transition"
            >
              <LogIn size={16} /> Sign In
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-widest transition"
          >
            Explore Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            YOUR ORDER BAG
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            SHOPPING CART ({cart.length} ITEMS)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-mono text-neutral-400 hover:text-[#E50914] uppercase transition"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Cart Items Table/List */}
        <div className="lg:col-span-8 bg-[#181818] border border-neutral-800 rounded-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-xs font-mono uppercase text-neutral-400">
            <span className="col-span-6">Silhouette</span>
            <span className="col-span-2 text-center">Price</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-neutral-800">
            {cart.map((item) => (
              <div
                key={`${item.product}-${item.selectedSize}`}
                className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
              >
                {/* Product Info */}
                <div className="sm:col-span-6 flex gap-4 items-center">
                  <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] font-mono text-neutral-400">Size:</span>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => updateSize(item.product, item.selectedSize, e.target.value)}
                        className="bg-[#121212] border border-neutral-700 text-[11px] font-mono text-white px-2 py-0.5 outline-none rounded-sm focus:border-[#E50914]"
                      >
                        {['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'].map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-sm">
                        Delivery: {getItemDeliveryCharge(item) === 0 ? 'FREE' : `৳${getItemDeliveryCharge(item)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product, item.selectedSize)}
                      className="text-[11px] font-mono text-red-500 hover:text-red-400 flex items-center gap-1 mt-1 transition"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-2 sm:text-center text-xs font-mono font-bold text-neutral-300">
                  <span className="sm:hidden text-neutral-400 font-normal">Price: </span>৳{' '}
                  {item.price.toLocaleString()}
                </div>

                {/* Quantity modifier */}
                <div className="sm:col-span-2 flex items-center sm:justify-center">
                  <div className="inline-flex items-center border border-neutral-800 bg-[#121212]">
                    <button
                      onClick={() =>
                        updateQuantity(item.product, item.selectedSize, item.quantity - 1)
                      }
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-xs font-mono text-white">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product, item.selectedSize, item.quantity + 1)
                      }
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Total per Item */}
                <div className="sm:col-span-2 sm:text-right font-mono font-black text-sm text-white">
                  <span className="sm:hidden text-neutral-400 font-normal">Subtotal: </span>৳{' '}
                  {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary Order Card */}
        <div className="lg:col-span-4 bg-[#181818] border border-neutral-800 p-6 rounded-sm space-y-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
            SUMMARY
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Items Total:</span>
              <span className="text-white font-bold">৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Cost (BD):</span>
              <span className="text-white font-bold">
                {shippingCost === 0 ? (
                  <span className="text-emerald-400 font-bold">FREE DELIVERY (৳0)</span>
                ) : (
                  `৳ ${shippingCost.toLocaleString()}`
                )}
              </span>
            </div>
            <div className="border-t border-neutral-800 pt-3 flex justify-between text-sm font-black text-white">
              <span>ESTIMATED TOTAL:</span>
              <span className="text-[#E50914] text-base">৳ {grandTotal.toLocaleString()} BDT</span>
            </div>
          </div>

          {!user && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-red-500" />
              <span>Sign in required before accessing checkout & payment.</span>
            </div>
          )}

          <button
            onClick={handleProceedCheckout}
            className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] text-white font-black uppercase tracking-widest text-xs transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)] cursor-pointer"
          >
            {user ? 'Proceed to Checkout' : 'Sign In to Checkout'} <ArrowRight size={16} />
          </button>

          <div className="text-[11px] font-mono text-neutral-400 text-center leading-relaxed">
            Payment handled securely via SSLCommerz (bKash, Nagad, Cards).
          </div>
        </div>
      </div>
    </div>
  );
}
