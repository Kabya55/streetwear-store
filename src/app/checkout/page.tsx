'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Loader2, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

const BD_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Gazipur',
  'Narayanganj',
  "Cox's Bazar",
  'Bogura',
  'Jashore',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Server-calculated totals — authoritative from MongoDB, never from frontend
  const [serverTotals, setServerTotals] = useState<{
    subtotal: number;
    totalDeliveryCharge: number;
    grandTotal: number;
    items: any[];
  } | null>(null);
  const [totalsLoading, setTotalsLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    district: 'Dhaka',
    thana: '',
    fullAddress: '',
    notes: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout&notice=login_required');
    }
  }, [user, authLoading, router]);

  // Pre-fill user contact info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Fetch SERVER-AUTHORITATIVE totals — prices & delivery charges from MongoDB
  useEffect(() => {
    if (cart.length === 0) {
      setServerTotals({ subtotal: 0, totalDeliveryCharge: 0, grandTotal: 0, items: [] });
      setTotalsLoading(false);
      return;
    }
    const fetchServerTotals = async () => {
      setTotalsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/cart/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart }),
        });
        if (res.ok) {
          const data = await res.json();
          setServerTotals(data);
        }
      } catch (e) {
        // Will show loading/0 state
      } finally {
        setTotalsLoading(false);
      }
    };
    fetchServerTotals();
  }, [cart]);

  // These are the ONLY values used for display and payment — all from MongoDB
  const grandTotal = serverTotals?.grandTotal ?? 0;
  const shippingCost = serverTotals?.totalDeliveryCharge ?? 0;
  const subtotal = serverTotals?.subtotal ?? 0;
  const serverItems = serverTotals?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/checkout&notice=login_required');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Create Order — backend recalculates price & delivery from DB (ignores frontend totalAmount)
      const orderRes = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          items: cart,
          shippingAddress: formData,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          router.push('/login?redirect=/checkout&notice=session_expired');
          return;
        }
        throw new Error(orderData.message || 'Failed to place order');
      }

      // 2. Initialize SSLCommerz Payment Session
      const paymentRes = await fetch(`${apiUrl}/payment/init`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          orderId: orderData._id || orderData.id,
        }),
      });

      const paymentData = await paymentRes.json();
      if (paymentData.url) {
        clearCart();
        window.location.href = paymentData.url;
      } else {
        throw new Error(paymentData.message || 'Payment gateway initialization failed');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during checkout.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E50914]" size={36} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-500">
          <Lock size={48} />
        </div>
        <h1 className="text-2xl font-black uppercase text-white tracking-tight">AUTHENTICATION REQUIRED</h1>
        <p className="text-xs font-mono text-neutral-400 max-w-sm">
          You must be logged in to proceed to checkout and secure your streetwear order.
        </p>
        <Link
          href="/login?redirect=/checkout&notice=login_required"
          className="px-6 py-3 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-wider transition"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase text-white">NO ITEMS TO CHECKOUT</h1>
        <p className="text-neutral-400 text-sm">Please add silhouettes to your cart before proceeding.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Return to Bag
      </Link>

      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
          DISPATCH CHECKPOINT
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
          SHIPPING & PAYMENT GATEWAY
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Billing / Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-[#181818] border border-neutral-800 p-6 sm:p-8 rounded-sm space-y-5">
            <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
              1. Customer & Delivery Address (Bangladesh)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Asif Mahmud"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Active Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                Email Address (For Invoice & Updates) *
              </label>
              <input
                required
                type="email"
                placeholder="asif@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  District *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Thana / Upazila *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dhanmondi, Banani, Uttara"
                  value={formData.thana}
                  onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                Detailed Street Address (House, Road, Block) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="House 24, Road 7A, Dhanmondi R/A, Dhaka-1209"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                Delivery Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Special courier gate instructions or timing preferences..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white focus:border-[#E50914] outline-none font-mono"
              />
            </div>
          </div>

          {/* SSLCommerz Trigger CTA — uses server grandTotal */}
          <button
            type="submit"
            disabled={loading || totalsLoading}
            className="w-full py-5 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 text-white font-black uppercase tracking-widest text-sm transition flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(229,9,20,0.35)]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> CONNECTING TO SSLCOMMERZ...
              </>
            ) : totalsLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> CALCULATING SERVER TOTAL...
              </>
            ) : (
              `PAY WITH SSLCOMMERZ (৳ ${grandTotal.toLocaleString()} BDT)`
            )}
          </button>
        </form>

        {/* Right: Order Review — server-calculated values */}
        <div className="lg:col-span-5 bg-[#181818] border border-neutral-800 p-6 sm:p-8 rounded-sm space-y-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            2. Manifest Overview ({cart.length} Silhouettes)
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 divide-y divide-neutral-900">
            {totalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-[#E50914]" size={24} />
                <span className="ml-2 text-xs font-mono text-neutral-400">Verifying prices from server...</span>
              </div>
            ) : (
              serverItems.map((item: any) => (
                <div
                  key={`${item.product}-${item.selectedSize}`}
                  className="pt-3 first:pt-0 flex justify-between items-center text-xs font-mono"
                >
                  <div>
                    <p className="font-bold text-white uppercase">{item.title}</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Qty: {item.quantity} · Size: {item.selectedSize} · Delivery:{' '}
                      <span className="text-neutral-300 font-bold">
                        {item.deliveryCharge === 0 ? 'FREE' : `৳${item.deliveryCharge}`}
                      </span>
                    </p>
                  </div>
                  <span className="font-bold text-white">
                    ৳ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="text-white font-bold">
                {totalsLoading ? '—' : `৳ ${subtotal.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Charge (BD):</span>
              <span className="text-white font-bold">
                {totalsLoading ? (
                  '—'
                ) : shippingCost === 0 ? (
                  <span className="text-emerald-400 font-bold">FREE DELIVERY (৳0)</span>
                ) : (
                  `৳ ${shippingCost.toLocaleString()}`
                )}
              </span>
            </div>
            <div className="border-t border-neutral-800 pt-3 flex justify-between text-sm font-black text-white">
              <span>PAYABLE AMOUNT:</span>
              <span className="text-[#E50914] text-base">
                {totalsLoading ? (
                  <Loader2 className="animate-spin inline" size={16} />
                ) : (
                  `৳ ${grandTotal.toLocaleString()} BDT`
                )}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#121212] border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
              <ShieldCheck size={16} className="text-[#E50914]" />
              SSLCommerz Sandbox Verified
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
              You will be redirected to the official SSLCommerz payment page to complete your payment with bKash, Nagad, or Credit/Debit Card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
