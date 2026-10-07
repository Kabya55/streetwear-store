import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    title: 'MEN',
    sub: 'STREET HEAVYWEIGHTS',
    link: '/products?category=men',
    img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'WOMEN',
    sub: 'AVANT-GARDE SILHOUETTES',
    link: '/products?category=women',
    img: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'KIDS',
    sub: 'JUNIOR REBELS',
    link: '/products?category=kids',
    img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800',
  },
];

export default function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            DIVISIONS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950 dark:text-white mt-1">
            Shop By Categories
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          All Categories <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <Link
            href={cat.link}
            key={idx}
            className="group relative h-96 overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={cat.img}
              alt={cat.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
              <span className="text-[11px] text-[#E50914] font-mono tracking-widest">{cat.sub}</span>
              <h3 className="text-3xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
