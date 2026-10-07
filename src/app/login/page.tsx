'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const notice = searchParams.get('notice');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        // default: if admin redirect to dashboard, else home
        const stored = localStorage.getItem('miralou_user');
        const user = stored ? JSON.parse(stored) : null;
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#181818] border border-neutral-800 p-8 rounded-sm space-y-6 shadow-2xl">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase flex items-center gap-1.5">
            <Lock size={14} /> VERIFICATION GATEWAY
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            MEMBER SIGN IN
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Sign in to view silhouette specs, checkout kicks, or access dashboard.
          </p>
        </div>

        {notice === 'auth_required' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-2">
            <Lock size={14} /> Please sign in or register to inspect this silhouette.
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Authenticate Session'}
          </button>
        </form>

        <div className="border-t border-neutral-800 pt-4 text-center text-xs font-mono text-neutral-400">
          Don't have an account yet?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-white hover:text-[#E50914] font-bold underline transition"
          >
            Register Here
          </Link>
        </div>

        <div className="bg-[#121212] border border-neutral-800 p-3 text-[11px] font-mono text-neutral-400 text-center">
          Admin Quick Login: <span className="text-white font-bold">admin@miralou.com / password123</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-neutral-400 font-mono text-xs">Loading sign-in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
