import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface FeaturedProductsSectionProps {
  products: any[];
}

export default function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            LATEST RELEASES
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950 dark:text-white mt-1">
            Our Products
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          Browse Full Vault <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product: any) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
