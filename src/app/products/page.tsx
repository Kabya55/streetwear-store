'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Loader2, X, Check, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface FilterMetadata {
  totalProducts: number;
  inStockCount: number;
  minPrice: number;
  maxPrice: number;
  categories: CategoryItem[];
  sizes: string[];
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State synced with URL parameters
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [size, setSize] = useState(searchParams.get('size') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Metadata from MongoDB / Server
  const [filterMeta, setFilterMeta] = useState<FilterMetadata>({
    totalProducts: 0,
    inStockCount: 0,
    minPrice: 0,
    maxPrice: 50000,
    categories: [],
    sizes: [],
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // 1. Fetch filter metadata from Database & Server
  const fetchFilterMetadata = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/filters`);
      if (res.ok) {
        const data = await res.json();
        setFilterMeta(data);
      }
    } catch (err) {
      console.error('Fetch filter metadata error:', err);
    }
  };

  useEffect(() => {
    fetchFilterMetadata();
  }, []);

  // 2. Sync local states when URL search params change (e.g. Back/Forward)
  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setSize(searchParams.get('size') || 'all');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setInStockOnly(searchParams.get('inStock') === 'true');
    setSort(searchParams.get('sort') || 'newest');

    const paramSearch = searchParams.get('search') || '';
    setSearch(paramSearch);
    setDebouncedSearch(paramSearch);
  }, [searchParams]);

  // 3. Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      updateUrlParam('search', search.trim());
    }, 150);

    return () => clearTimeout(timer);
  }, [search]);

  // Helper to update a URL parameter cleanly
  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/products${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  // 4. Fetch Products (Server-processed via MongoDB)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const activeCat = searchParams.get('category') || category;
      const activeSize = searchParams.get('size') || size;
      const activeMin = searchParams.get('minPrice') || minPrice;
      const activeMax = searchParams.get('maxPrice') || maxPrice;
      const activeInStock = searchParams.get('inStock') === 'true' || inStockOnly;
      const activeSort = searchParams.get('sort') || sort;
      const activeSearch = debouncedSearch;

      const queryParams = new URLSearchParams();
      if (activeCat && activeCat !== 'all') queryParams.set('category', activeCat);
      if (activeSize && activeSize !== 'all') queryParams.set('size', activeSize);
      if (activeMin) queryParams.set('minPrice', activeMin);
      if (activeMax) queryParams.set('maxPrice', activeMax);
      if (activeInStock) queryParams.set('inStock', 'true');
      if (activeSort) queryParams.set('sort', activeSort);
      if (activeSearch && activeSearch.trim()) queryParams.set('search', activeSearch.trim());

      const res = await fetch(`${apiUrl}/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, debouncedSearch, sort]);

  // Handlers
  const handleCategorySelect = (catSlug: string) => {
    setCategory(catSlug);
    updateUrlParam('category', catSlug);
  };

  const handleSizeSelect = (selectedSize: string) => {
    setSize(selectedSize);
    updateUrlParam('size', selectedSize);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    router.replace(`/products${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const handleToggleStock = () => {
    const next = !inStockOnly;
    setInStockOnly(next);
    updateUrlParam('inStock', next ? 'true' : null);
  };

  const handleClearAllFilters = () => {
    setCategory('all');
    setSize('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSearch('');
    setDebouncedSearch('');
    setSort('newest');
    router.replace('/products', { scroll: false });
  };

  const hasActiveFilters =
    (category && category !== 'all') ||
    (size && size !== 'all') ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly ||
    search.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Page Title & Breadcrumbs */}
      <div>
        <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
          ARCHIVE / 2026 CATALOG
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-950 dark:text-white mt-1">
          ALL STREETWEAR KICKS
        </h1>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 p-4 rounded-sm shadow-sm transition-colors">
        {/* Real-time Search Bar */}
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 flex-1 max-w-md relative">
          <Search size={18} className="text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="Search silhouettes in real-time..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-neutral-950 dark:text-white text-xs outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDebouncedSearch('');
                updateUrlParam('search', null);
              }}
              className="text-neutral-400 hover:text-neutral-950 dark:hover:text-white p-1 rounded transition"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase hidden sm:inline">
            Sort By:
          </span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateUrlParam('sort', e.target.value);
            }}
            className="bg-neutral-50 dark:bg-[#121212] border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-300 text-xs px-3 py-2 outline-none font-mono rounded-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High (৳)</option>
            <option value="price-desc">Price: High to Low (৳)</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary Bar (if any) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-neutral-500 dark:text-neutral-400 uppercase text-[11px] font-bold">
            Active Filters:
          </span>

          {category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] rounded-full uppercase font-bold text-[11px]">
              Category: {category}
              <button onClick={() => handleCategorySelect('all')} className="hover:opacity-75">
                <X size={13} />
              </button>
            </span>
          )}

          {size !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full uppercase text-[11px]">
              Size: {size}
              <button onClick={() => handleSizeSelect('all')} className="hover:opacity-75">
                <X size={13} />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full uppercase text-[11px]">
              Price: ৳{minPrice || '0'} - ৳{maxPrice || 'MAX'}
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('minPrice');
                  params.delete('maxPrice');
                  router.replace(`/products${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
                }}
                className="hover:opacity-75"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full uppercase font-bold text-[11px]">
              In Stock Only
              <button onClick={handleToggleStock} className="hover:opacity-75">
                <X size={13} />
              </button>
            </span>
          )}

          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full uppercase text-[11px]">
              Keyword: "{search}"
              <button
                onClick={() => {
                  setSearch('');
                  setDebouncedSearch('');
                  updateUrlParam('search', null);
                }}
                className="hover:opacity-75"
              >
                <X size={13} />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAllFilters}
            className="text-[11px] text-[#E50914] hover:underline font-bold uppercase ml-2 flex items-center gap-1"
          >
            <RefreshCw size={12} /> Clear All
          </button>
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Complete Database-Driven Sidebar Filters */}
        <aside className="lg:col-span-3 bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 p-6 rounded-sm space-y-6 shadow-sm transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-950 dark:text-white">
              <Filter size={14} className="text-[#E50914]" />
              <span>Database Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-[10px] font-mono text-[#E50914] hover:underline uppercase font-bold"
              >
                Reset
              </button>
            )}
          </div>

          {/* 1. Category Filter Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Categories ({filterMeta.categories.length + 1})
            </h4>
            <div className="flex flex-row lg:flex-col gap-1.5 flex-wrap">
              {/* All Collections Button */}
              <button
                onClick={() => handleCategorySelect('all')}
                className={`text-left text-xs uppercase font-mono px-3 py-2 rounded-sm transition flex items-center justify-between w-full ${
                  category === 'all'
                    ? 'bg-[#E50914] text-white font-bold shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <span>All Collections</span>
                <span className="text-[10px] opacity-75 font-normal">
                  ({filterMeta.totalProducts})
                </span>
              </button>

              {/* Dynamic Categories from MongoDB */}
              {filterMeta.categories.map((cat) => {
                const isSelected = category.toLowerCase() === (cat.slug || cat.id).toLowerCase();
                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => handleCategorySelect(cat.slug || cat.id)}
                    className={`text-left text-xs uppercase font-mono px-3 py-2 rounded-sm transition flex items-center justify-between w-full ${
                      isSelected
                        ? 'bg-[#E50914] text-white font-bold shadow-sm'
                        : 'text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name || cat.slug}</span>
                    <span className="text-[10px] opacity-75 shrink-0 font-normal">
                      ({cat.count ?? 0})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Stock Availability Filter */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Stock Status
            </h4>
            <button
              onClick={handleToggleStock}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-mono transition border ${
                inStockOnly
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                    inStockOnly
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-neutral-400 dark:border-neutral-600'
                  }`}
                >
                  {inStockOnly && <Check size={11} strokeWidth={3} />}
                </span>
                In Stock Only
              </span>
              <span className="text-[10px] opacity-75">({filterMeta.inStockCount})</span>
            </button>
          </div>

          {/* 3. Size Filter Section */}
          {filterMeta.sizes.length > 0 && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Size Filter
                </h4>
                {size !== 'all' && (
                  <button
                    onClick={() => handleSizeSelect('all')}
                    className="text-[10px] font-mono text-[#E50914] hover:underline"
                  >
                    Clear Size
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSizeSelect('all')}
                  className={`py-1.5 text-[11px] font-mono uppercase text-center rounded-sm transition border ${
                    size === 'all'
                      ? 'bg-[#E50914] border-[#E50914] text-white font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600'
                  }`}
                >
                  ALL
                </button>
                {filterMeta.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeSelect(s)}
                    className={`py-1.5 text-[11px] font-mono uppercase text-center rounded-sm transition border ${
                      size === s
                        ? 'bg-[#E50914] border-[#E50914] text-white font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Price Range Filter Section */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Price Range (৳ BDT)
            </h4>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Min</span>
                  <input
                    type="number"
                    placeholder={String(filterMeta.minPrice || 0)}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#121212] border border-neutral-300 dark:border-neutral-800 p-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#E50914] rounded-sm font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Max</span>
                  <input
                    type="number"
                    placeholder={String(filterMeta.maxPrice || 50000)}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#121212] border border-neutral-300 dark:border-neutral-800 p-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#E50914] rounded-sm font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-[#E50914] text-white text-xs font-mono uppercase font-bold tracking-wider rounded-sm transition"
              >
                Apply Price Filter
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono leading-relaxed">
              All prices shown in Bangladeshi Taka (৳ BDT) inclusive of quality checks & VAT.
            </p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader2 className="animate-spin text-[#E50914]" size={36} />
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 p-12 text-center rounded-sm shadow-sm transition-colors">
              <p className="text-lg font-bold text-neutral-950 dark:text-white uppercase font-mono">
                No Silhouettes Found
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
                No items match the active server filters. Try adjusting your category, price range, or keywords.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="mt-6 px-6 py-2.5 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <span>
                  Showing <strong className="text-neutral-950 dark:text-white">{products.length}</strong> {products.length === 1 ? 'silhouette' : 'silhouettes'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-neutral-500">
            <Loader2 className="animate-spin text-[#E50914]" size={18} />
            Loading Footwear Vault...
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
