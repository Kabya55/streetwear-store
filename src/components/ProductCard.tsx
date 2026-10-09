'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    title: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
    sizes?: string[];
    deliveryCharge?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const productId = product._id || product.id || '';
  const mainImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800';

  // Navigate to product details only if logged in; otherwise redirect to login
  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${productId}&notice=auth_required`);
    } else {
      router.push(`/products/${productId}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products/${productId}&notice=auth_required`);
      return;
    }
    const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';
    await addToCart({
      product: productId,
      title: product.title,
      price: product.price,
      selectedSize,
      image: mainImage,
      quantity: 1,
      deliveryCharge: product.deliveryCharge,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products/${productId}&notice=auth_required`);
      return;
    }
    // Navigate to product details to select size and instant checkout
    router.push(`/products/${productId}`);
  };

  return (
    <div className="group bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      {/* Product Image Frame */}
      <div
        onClick={handleProductClick}
        className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 block cursor-pointer"
      >
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 text-[#E50914] shadow-sm">
          {product.category}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400 text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
            LOW STOCK ({product.stock})
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div onClick={handleProductClick} className="cursor-pointer">
          <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white group-hover:text-[#1299e8] transition truncate">
            {product.title}
          </h3>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-black font-mono text-[#1299e8]">
              ৳ {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono">
              {product.deliveryCharge === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE DEL</span>
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400">Del: ৳{product.deliveryCharge ?? 120}</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart (Blue #1299e8) & Buy Now (Orange #ff6b00) */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1299e8]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_12px_rgba(18,153,232,0.35)] disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 !text-white text-white text-xs font-bold uppercase tracking-wider rounded-full hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(18,153,232,0.5)] active:translate-y-0 transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            <ShoppingCart size={14} className="text-white" />
            <span className="truncate text-white font-bold">{added ? 'Added' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_12px_rgba(255,107,0,0.35)] disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 !text-white text-white text-xs font-bold uppercase tracking-wider rounded-full hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:translate-y-0 transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            <ShoppingBag size={14} className="text-white" />
            <span className="truncate text-white font-bold">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
