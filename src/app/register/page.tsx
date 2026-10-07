'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#181818] border border-neutral-800 p-8 rounded-sm space-y-6 shadow-2xl">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles size={14} /> NEW MEMBER REGISTRATION
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            JOIN THE VAULT
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Create your account to unlock streetwear details & order kicks.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Full Legal Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Asif Mahmud"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Email Address *
            </label>
            <input
              required
              type="email"
              placeholder="asif@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Choose Password (Min 6 chars) *
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

          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
              Confirm Password *
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account & Proceed'}
          </button>
        </form>

        <div className="border-t border-neutral-800 pt-4 text-center text-xs font-mono text-neutral-400">
          Already a member?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-white hover:text-[#E50914] font-bold underline transition"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-neutral-400 font-mono text-xs">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
