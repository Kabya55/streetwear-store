'use client';

import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import AntigravityParticles from './AntigravityParticles';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-[#f8f9fa] via-white to-[#f1f2f4] dark:from-[#181818] dark:via-[#121212] dark:to-[#121212] px-6 text-center overflow-hidden transition-colors duration-300">
      {/* Google Antigravity Interactive Particles Canvas Background */}
      <AntigravityParticles />

      {/* Streetwear ambient red glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.10)_0,transparent_65%)] pointer-events-none dark:opacity-100 opacity-30 z-[1]" />

      <div className="max-w-5xl space-y-8 z-10 py-16 pointer-events-auto">
        {/* Drop Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-300 dark:border-neutral-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#E50914] shadow-sm">
          <Flame size={14} /> <span>2026 DROP ARCHIVE / DHAKA EDITION</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none font-mono text-neutral-950 dark:text-white select-none">
          CHOOSE YOUR <span className="text-[#E50914] underline decoration-neutral-300 dark:decoration-neutral-700 decoration-2">SHOES</span> WITH US
        </h1>

        {/* Description */}
        <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          High-octane footwear crafted for those who own the midnight streets. Built with military-grade resilience and pure streetwear spirit.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/products"
            className="w-full sm:w-auto px-9 py-4 bg-[#E50914]/90 backdrop-blur-md border border-white/30 !text-white text-white font-bold text-xs tracking-widest uppercase rounded-full flex items-center justify-center gap-2 group shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_8px_30px_rgba(229,9,20,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(229,9,20,0.55)] active:translate-y-0 transition-all duration-200"
            style={{ color: '#ffffff' }}
          >
            Enter The Vault <ArrowRight size={16} className="group-hover:translate-x-1 transition text-white" />
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto px-9 py-4 border border-neutral-300/80 dark:border-white/20 text-neutral-900 dark:text-white bg-white/70 dark:bg-white/10 backdrop-blur-md font-bold text-xs tracking-widest uppercase rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-lg active:translate-y-0 hover:text-[#1299e8] hover:border-[#1299e8] transition-all duration-200"
          >
            Our Philosophy
          </Link>
        </div>
      </div>
    </section>
  );
}
