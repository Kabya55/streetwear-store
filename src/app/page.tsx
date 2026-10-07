import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection';
import BrandStorySection from '@/components/home/BrandStorySection';

// Fetch products from backend API, or fallback to curated streetwear collection
async function getHomeProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.log('[Home SSR fetch fallback]');
  }

  // High-end fallback sneaker catalog
  return [
    {
      _id: '1',
      title: 'CYBER-RUNNER V3 "PHANTOM BLACK"',
      description: 'Deconstructed upper engineered from ballistic nylon and calfskin suede with aggressive asphalt tread outsole.',
      price: 14500,
      category: 'men',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=900'],
      sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    },
    {
      _id: '2',
      title: 'NIGHTHAWK MID STRIKE "ACID VOLT"',
      description: 'Architectural TPU cage structure with quick-draw toggle lacing system and crimson shock-absorption air unit.',
      price: 12200,
      category: 'women',
      stock: 18,
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=900'],
      sizes: ['EU 37', 'EU 38', 'EU 39', 'EU 40'],
    },
    {
      _id: '3',
      title: 'APEX DRIFT "MONOCHROME GLITCH"',
      description: 'Low-profile avant-garde runner with breathable jacquard knit upper and 3M reflective side banding.',
      price: 16800,
      category: 'men',
      stock: 12,
      images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=900'],
      sizes: ['EU 41', 'EU 42', 'EU 43', 'EU 44'],
    },
    {
      _id: '4',
      title: 'NEO-LOW MATRIX "CRIMSON CORE"',
      description: 'Minimalist skate-ready streetwear sneaker crafted with vulcanized dual-density cupsole and distressed nubuck leather.',
      price: 9500,
      category: 'kids',
      stock: 30,
      images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=900'],
      sizes: ['EU 34', 'EU 35', 'EU 36', 'EU 37'],
    },
  ];
}

export default async function HomePage() {
  const products = await getHomeProducts();

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. SHOP BY CATEGORIES SECTION */}
      <CategoriesSection />

      {/* 3. OUR PRODUCTS GRID */}
      <FeaturedProductsSection products={products} />

      {/* 4. BRAND ABOUT SNIPPET & VALUE PROPOSITIONS */}
      <BrandStorySection />
    </div>
  );
}
