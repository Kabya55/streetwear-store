'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#0d0d0d] text-neutral-600 dark:text-neutral-400 text-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-widest uppercase font-mono text-neutral-950 dark:text-white inline-block hover:text-[#1299e8] dark:hover:text-[#1299e8] transition"
          >
            MIRALOU<span className="text-[#E50914]">.</span>
          </Link>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
            High-performance streetwear footgear engineered for urban navigators. Built with
            industrial fabrics, bespoke soles, and brutalist minimalism. Designed for Dhaka, Tokyo, and beyond.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
            <ShieldCheck size={16} className="text-[#1299e8]" />
            <span>OFFICIAL SSLCOMMERZ SECURED GATEWAY</span>
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 space-y-3 font-mono text-xs">
          <h4 className="text-neutral-950 dark:text-white font-bold uppercase tracking-wider">NAVIGATE</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8] transition">
                All Sneakers
              </Link>
            </li>
            <li>
              <Link href="/products?category=men" className="text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8] transition">
                Men's Collection
              </Link>
            </li>
            <li>
              <Link href="/products?category=women" className="text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8] transition">
                Women's Collection
              </Link>
            </li>
            <li>
              <Link href="/products?category=kids" className="text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8] transition">
                Junior Drops
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8] transition">
                Manifesto & Vision
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-neutral-950 dark:text-white font-bold font-mono text-xs uppercase tracking-wider">
            JOIN THE UNDERGROUND
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Subscribe for secret vault access, midnight releases, and private drops.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 p-3">
              <Check size={16} /> YOU ARE ON THE GUESTLIST
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                required
                placeholder="YOUR EMAIL..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-neutral-300 dark:border-neutral-800 px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#1299e8] font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded-full"
              />
              <button
                type="submit"
                className="bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_14px_rgba(255,107,0,0.35)] !text-white text-white px-6 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center rounded-full shrink-0"
                style={{ color: '#ffffff' }}
              >
                <ArrowRight size={16} className="text-white" />
              </button>
            </form>
          )}
          <div className="pt-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono uppercase">
            Payment Partners: bKash · Nagad · Visa · Mastercard · Rocket
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-900 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 font-mono">
        © {new Date().getFullYear()} MIRALOU STREETWEAR INC. ALL RIGHTS RESERVED. POWERED BY NEXT.JS & EXPRESS.
      </div>
    </footer>
  );
}
