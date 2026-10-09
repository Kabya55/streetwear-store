'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, ArrowLeft, ShieldCheck, Zap, RotateCcw, Loader2, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Enforce authentication to view details page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/products/${id}&notice=auth_required`);
    }
  }, [user, authLoading, id, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setSelectedImage(data.images?.[0] || '');
          setSelectedSize(data.sizes?.[0] || 'EU 42');
        }
      } catch (err) {
        console.error('Fetch product detail failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Lock className="text-[#E50914] animate-bounce" size={40} />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          MEMBER AUTHENTICATION REQUIRED · REDIRECTING TO LOGIN...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E50914]" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase text-white">SILHOUETTE NOT FOUND</h1>
        <p className="text-neutral-400 text-sm">The requested item has either expired or been archived.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Archive
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      product: product._id || product.id,
      title: product.title,
      price: product.price,
      selectedSize,
      image: selectedImage || product.images?.[0],
      quantity,
      deliveryCharge: product.deliveryCharge !== undefined ? Number(product.deliveryCharge) : 120,
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-[#1299e8] transition"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square w-full bg-[#181818] border border-neutral-800 rounded-sm overflow-hidden">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 flex-shrink-0 bg-[#181818] border rounded-sm overflow-hidden ${
                    selectedImage === img ? 'border-[#1299e8]' : 'border-neutral-800'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#1299e8] tracking-widest uppercase">
              {product.category} COLLECTION
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <span className="text-2xl font-black font-mono text-[#1299e8]">
                ৳ {product.price.toLocaleString()} BDT
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-emerald-400 font-bold rounded-sm">
                {product.deliveryCharge === 0 ? 'FREE DELIVERY' : `Delivery: ৳${product.deliveryCharge ?? 120} BDT`}
              </span>
            </div>
          </div>

          {/* Stock status indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-neutral-300">
              {product.stock > 0 ? `IN STOCK (${product.stock} UNITS LEFT)` : 'OUT OF STOCK'}
            </span>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono uppercase text-neutral-400">
              <span>Select Footwear Size:</span>
              <span className="text-white font-bold">{selectedSize}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {(product.sizes || ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44']).map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-xs font-mono font-bold rounded-sm border transition ${
                    selectedSize === size
                      ? 'border-[#ff6b00] bg-[#ff6b00] text-white font-bold'
                      : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-[#181818] text-neutral-900 dark:text-neutral-300 hover:border-neutral-500 font-bold'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-400">Quantity:</span>
            <div className="inline-flex items-center border border-neutral-800 bg-[#181818]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-white hover:text-[#1299e8] transition"
              >
                -
              </button>
              <span className="px-4 py-2 font-mono text-sm text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                className="px-4 py-2 text-white hover:text-[#1299e8] transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {addedMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              Item Added To Bag Successfully!
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-4 bg-[#1299e8]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_6px_20px_rgba(18,153,232,0.35)] disabled:bg-neutral-800 disabled:text-neutral-500 !text-white text-white font-black uppercase tracking-widest text-xs rounded-full hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(18,153,232,0.5)] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              style={{ color: '#ffffff' }}
            >
              <ShoppingCart size={16} className="text-white" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full py-4 bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_6px_20px_rgba(255,107,0,0.35)] disabled:bg-neutral-800 disabled:text-neutral-500 !text-white text-white font-black uppercase tracking-widest text-xs rounded-full hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,107,0,0.5)] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              style={{ color: '#ffffff' }}
            >
              <ShoppingBag size={16} className="text-white" /> Buy Now (৳ BDT)
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-neutral-800 pt-6 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              PRODUCT SPECIFICATIONS
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{product.description}</p>
          </div>

          {/* Security & Logistics Badges */}
          <div className="border-t border-neutral-800 pt-6 space-y-3 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-3">
              <Zap size={16} className="text-[#E50914]" />
              <span>48-Hour Courier Express within Dhaka City</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[#E50914]" />
              <span>Authentic High-Performance Materials</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={16} className="text-[#E50914]" />
              <span>7-Day Return & Size Exchange Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
