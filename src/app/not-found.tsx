import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex p-4 rounded-full bg-neutral-900 border border-neutral-800 text-[#E50914]">
          <Compass size={48} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            ERROR 404 / ROUTE LOST
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono">
            SILHOUETTE NOT FOUND
          </h1>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            The streetwear coordinates you are searching for do not exist or have been removed from the archive vault.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-widest transition shadow-[0_0_20px_rgba(229,9,20,0.3)]"
          >
            <ArrowLeft size={16} /> Return to Home Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
