import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
          MANIFESTO & VISION
        </span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
          THE MIRALOU STORY
        </h1>
        <p className="text-neutral-400 text-base max-w-2xl mx-auto font-light leading-relaxed">
          Born from the concrete pulse of Dhaka and influenced by avant-garde silhouettes from Tokyo and London.
        </p>
      </div>

      {/* Hero Visual Image */}
      <div className="aspect-[21/9] w-full bg-[#181818] border border-neutral-800 rounded-sm overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1400"
          alt="Streetwear Craftsmanship"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Grid: Mission, Vision, Craft */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#181818] border border-neutral-800 p-8 rounded-sm space-y-3">
          <Compass className="text-[#E50914]" size={28} />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Our Mission</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            To provide Bangladesh’s underground fashion culture with uncompromising footwear built with
            aerospace-grade durability, architectural proportions, and zero filler.
          </p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 p-8 rounded-sm space-y-3">
          <Zap className="text-[#E50914]" size={28} />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Brutalist Design</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            Every sole mold is customized. We eliminate corporate sneaker cliches in favor of bold
            deconstructed panelling, aggressive lugs, and tonal monochrome finishes.
          </p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 p-8 rounded-sm space-y-3">
          <ShieldCheck className="text-[#E50914]" size={28} />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Direct-to-Street</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            By avoiding middleman markup and utilizing SSLCommerz automated payment corridors, we deliver
            designer-tier footwear at accessible domestic pricing.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="border border-neutral-800 bg-[#181818] p-8 text-center space-y-6">
        <h2 className="text-2xl font-black uppercase text-white tracking-tight">
          READY TO OWN YOUR SILHOUETTE?
        </h2>
        <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto">
          Explore our limited batch sneaker drops before allocations are fully claimed.
        </p>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-widest transition"
          >
            Enter The Vault <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
