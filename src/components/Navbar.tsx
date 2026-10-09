'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: 'ALL DROPS', href: '/products', key: 'all' },
    { label: 'MEN', href: '/products?category=men', key: 'men' },
    { label: 'WOMEN', href: '/products?category=women', key: 'women' },
    { label: 'KIDS', href: '/products?category=kids', key: 'kids' },
    { label: 'ABOUT', href: '/about', key: 'about' },
  ];

  const isNavActive = (key: string) => {
    if (key === 'about') {
      return pathname === '/about';
    }
    if (pathname === '/products') {
      const currentCat = searchParams.get('category');
      if (key === 'all') {
        return !currentCat || currentCat === 'all';
      }
      return currentCat?.toLowerCase() === key.toLowerCase();
    }
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#121212]/90 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="text-2xl md:text-3xl font-black tracking-widest uppercase font-mono text-neutral-950 dark:text-white hover:text-[#1299e8] dark:hover:text-[#1299e8] transition"
          >
            MIRALOU<span className="text-[#E50914]">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase">
            {navLinks.map((item) => {
              const active = isNavActive(item.key);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative py-2 transition-all duration-150 ${
                    active
                      ? 'text-[#E50914] font-black'
                      : 'text-neutral-600 hover:text-[#1299e8] dark:text-neutral-400 dark:hover:text-[#1299e8]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,1)] rounded-full animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 text-neutral-700 dark:text-neutral-300">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-[#1299e8] dark:hover:text-[#1299e8] transition"
              title="Search store"
            >
              <Search size={20} />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="relative w-9 h-9 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#1299e8] bg-neutral-100 dark:bg-neutral-900/50 transition-all duration-300 group overflow-hidden"
              id="theme-toggle-btn"
            >
              {/* Dark mode icon */}
              <Moon
                size={16}
                className={`absolute transition-all duration-300 ${
                  theme === 'dark'
                    ? 'opacity-100 scale-100 rotate-0 text-yellow-300'
                    : 'opacity-0 scale-50 rotate-90 text-yellow-300'
                }`}
              />
              {/* Light mode icon */}
              <Sun
                size={16}
                className={`absolute transition-all duration-300 ${
                  theme === 'light'
                    ? 'opacity-100 scale-100 rotate-0 text-orange-500'
                    : 'opacity-0 scale-50 -rotate-90 text-orange-500'
                }`}
              />
            </button>

            {/* Shopping Cart Bag */}
            <Link href="/cart" className="relative hover:text-[#1299e8] dark:hover:text-[#1299e8] transition group">
              <ShoppingBag size={22} className="group-hover:scale-110 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ff6b00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212]">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 focus:outline-none group p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
                  title={user.name}
                >
                  {/* Avatar Picture */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 group-hover:border-[#1299e8] transition"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 group-hover:border-[#1299e8] text-neutral-900 dark:text-white font-black text-xs font-mono flex items-center justify-center transition">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Down Arrow for Admin (and general user menu) */}
                  <ChevronDown
                    size={15}
                    className={`text-neutral-500 dark:text-neutral-400 group-hover:text-[#1299e8] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-[#1299e8]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Header */}
                    <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-950 dark:text-white truncate font-sans">{user.name}</p>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2">
                        {user.role === 'admin' ? (
                          <span className="inline-block px-2 py-0.5 bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff6b00] text-[10px] font-bold font-mono tracking-wider uppercase rounded-sm">
                            ★ Store Administrator
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono uppercase rounded-sm">
                            Vault Member
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Admin Dashboard Button (Only if user is Admin) */}
                    {user.role === 'admin' && (
                      <div className="p-1.5 border-b border-neutral-200 dark:border-neutral-800">
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)] !text-white text-white text-xs font-bold font-mono uppercase tracking-wider rounded-full hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                          style={{ color: '#ffffff' }}
                        >
                          <LayoutDashboard size={15} className="text-white" /> Dashboard Console
                        </Link>
                      </div>
                    )}

                    {/* Sign Out Button */}
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-neutral-600 hover:text-red-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-neutral-900 rounded-sm transition"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Not Logged In: Sign In Button */
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-neutral-300 dark:border-white/20 hover:border-[#1299e8] hover:text-[#1299e8] text-neutral-950 dark:text-white text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <UserIcon size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818] px-6 py-4">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
              <Search size={18} className="text-neutral-500" />
              <input
                type="text"
                placeholder="SEARCH KICKS, SILHOUETTES, OR STYLES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-neutral-950 dark:text-white text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_14px_rgba(255,107,0,0.35)] !text-white text-white text-xs font-bold uppercase tracking-wider rounded-full hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                style={{ color: '#ffffff' }}
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] px-6 py-6 space-y-3">
            {navLinks.map((item) => {
              const active = isNavActive(item.key);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-bold uppercase tracking-wider py-2 transition rounded-sm ${
                    active
                      ? 'text-[#1299e8] font-black pl-3 border-l-2 border-[#1299e8] bg-blue-50 dark:bg-blue-950/20'
                      : 'text-neutral-700 hover:text-[#1299e8] dark:text-neutral-300 dark:hover:text-[#1299e8] pl-3'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Signed in as {user.name}</p>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-[#ff6b00]"
                  >
                    ★ Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-xs font-mono text-red-600 dark:text-red-400 uppercase pt-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 bg-[#ff6b00]/90 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)] !text-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                  style={{ color: '#ffffff' }}
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
