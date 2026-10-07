'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tranId') || 'UNKNOWN';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#181818] border border-neutral-800 p-8 rounded-sm text-center space-y-6 shadow-2xl">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
          <XCircle size={52} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-[#E50914] tracking-widest uppercase">
            TRANSACTION INCOMPLETE
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            PAYMENT FAILED
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            SSLCommerz was unable to authorize your payment. No funds were debited from your account.
          </p>
        </div>

        <div className="bg-[#121212] border border-neutral-800 p-4 rounded-sm text-left font-mono text-xs space-y-1">
          <div className="text-neutral-500 text-[10px] uppercase">Attempted Transaction ID</div>
          <div className="font-bold text-neutral-300 text-sm break-all">{tranId}</div>
          <div className="text-red-400 text-[11px] font-semibold pt-1">STATUS: UNPAID / CANCELLED</div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/checkout"
            className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Retry Payment
          </Link>
          <Link
            href="/cart"
            className="w-full py-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Review Shopping Bag
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-neutral-400 font-mono text-xs">Loading payment details...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
