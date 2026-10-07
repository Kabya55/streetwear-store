'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, ShoppingBag } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tranId') || 'TXN_VERIFIED';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#181818] border border-neutral-800 p-8 rounded-sm text-center space-y-6 shadow-2xl">
        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={52} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-[#E50914] tracking-widest uppercase">
            SSLCOMMERZ CONFIRMATION
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            PAYMENT CONFIRMED
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            Your transaction has been approved. Your streetwear footwear order has entered dispatch queue.
          </p>
        </div>

        <div className="bg-[#121212] border border-neutral-800 p-4 rounded-sm text-left font-mono text-xs space-y-1">
          <div className="text-neutral-500 text-[10px] uppercase">Transaction ID</div>
          <div className="font-bold text-white text-sm break-all">{tranId}</div>
          <div className="text-emerald-400 text-[11px] font-semibold pt-1">
            STATUS: PAID · ORDER PROCESSING
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/products"
            className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
          <Link
            href="/"
            className="w-full py-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white font-bold uppercase tracking-wider text-xs transition block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-neutral-400 font-mono text-xs">Loading order confirmation...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
