import Link from 'next/link';
import { ArrowRight, Flame, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function BrandStorySection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 p-8 md:p-12 rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            ORIGIN STORY
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
            CRAFTED FOR THE UNCOMPROMISING
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            MIRALOU was founded on the belief that sneakers are wearable architecture. Every stitch,
            reinforced tread, and tonal silhouette is tested for the raw streets of Bangladesh and beyond.
            From late night asphalt cruises to everyday movement, we provide supreme comfort wrapped in dark brutalist aesthetics.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-neutral-950 dark:text-white hover:text-[#1299e8] dark:hover:text-[#1299e8] transition-colors"
            >
              Read The Full Manifesto <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-5 rounded-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <Zap className="text-[#E50914] mb-2" size={24} />
            <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white">48H DELIVERY</h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Express dispatch nationwide in Bangladesh.</p>
          </div>
          <div className="bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-5 rounded-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <ShieldCheck className="text-[#E50914] mb-2" size={24} />
            <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white">100% AUTHENTIC</h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Certified premium industrial grade materials.</p>
          </div>
          <div className="bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-5 rounded-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <Sparkles className="text-[#E50914] mb-2" size={24} />
            <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white">SSLCOMMERZ</h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Encrypted bKash, Nagad & Card payment.</p>
          </div>
          <div className="bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-5 rounded-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <Flame className="text-[#E50914] mb-2" size={24} />
            <h4 className="text-xs font-bold uppercase text-neutral-950 dark:text-white">LIMITED DROPS</h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Numbered and small-batch production runs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
