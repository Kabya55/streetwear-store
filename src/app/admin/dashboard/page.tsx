'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  ShoppingBag,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  SlidersHorizontal,
  ShieldAlert,
  Loader2,
  Eye,
  Pencil,
  X,
  Truck,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'products'>('analytics');
  const [loading, setLoading] = useState(true);

  // Stats & Timeframe Range
  const [statsRange, setStatsRange] = useState<'weekly' | 'monthly' | 'yearly' | 'total'>('total');
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalUsers: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalPaid: 0,
    totalPendingAmount: 0,
  });

  // Orders, Users, Products Lists
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Search & Orders Pagination state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(5);

  // Search & Users Pagination state
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState<number>(1);
  const [usersPerPage, setUsersPerPage] = useState<number>(5);

  // Delivery Charge State (Saved to MongoDB)
  const [deliveryCharge, setDeliveryCharge] = useState<number>(120);
  const [deliveryChargeInput, setDeliveryChargeInput] = useState<string>('120');
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);
  const [deliveryChargeMessage, setDeliveryChargeMessage] = useState('');

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'men',
    stock: '',
    images: '',
    description: '',
    deliveryCharge: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Dynamic categories fetched from database
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([
    { id: 'men', name: 'Men Footwear', slug: 'men' },
    { id: 'women', name: 'Women Footwear', slug: 'women' },
    { id: 'kids', name: 'Junior / Kids', slug: 'kids' },
  ]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Custom category state for edit modal
  const [isEditCustomCategory, setIsEditCustomCategory] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: 'men',
    stock: '',
    images: '',
    description: '',
    deliveryCharge: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Product Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      const timer = setTimeout(() => {
        router.push('/login?redirect=/admin/dashboard&notice=admin_required');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  // Reset order pagination when search query or page size changes
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, ordersPerPage]);

  // Reset user pagination when search query or page size changes
  useEffect(() => {
    setUserPage(1);
  }, [userSearch, usersPerPage]);

  const fetchAdminData = async (rangeOverride?: 'weekly' | 'monthly' | 'yearly' | 'total') => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const activeRange = rangeOverride || statsRange;
      const [statsRes, ordersRes, usersRes, prodsRes, settingsRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/admin/stats?range=${activeRange}`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/admin/orders`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/admin/users`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/products`),
        fetch(`${apiUrl}/settings`),
        fetch(`${apiUrl}/products/categories`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
        }
      }
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData?.deliveryCharge !== undefined) {
          setDeliveryCharge(Number(sData.deliveryCharge));
          setDeliveryChargeInput(String(sData.deliveryCharge));
        }
      }
    } catch (err) {
      console.error('Admin data fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  // Instant timeframe switcher for stats
  const handleRangeChange = async (range: 'weekly' | 'monthly' | 'yearly' | 'total') => {
    setStatsRange(range);
    setStatsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/admin/stats?range=${range}`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Range stats error', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [authLoading, user]);

  // Update order delivery status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, deliveryStatus: newStatus } : o))
        );
        fetchAdminData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not update delivery status in MongoDB');
      }
    } catch (err) {
      alert('Error updating delivery status');
    }
  };

  // Update order payment status (Paid / Pending)
  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: newStatus } : o))
        );
        fetchAdminData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not update payment status');
      }
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  // Update a user's role (admin / editor / user)
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not update user role');
      }
    } catch (err) {
      alert('Error updating user role');
    }
  };

  // Update store-wide delivery charge in MongoDB
  const handleUpdateDeliveryCharge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const chargeVal = Number(deliveryChargeInput);
    if (isNaN(chargeVal) || chargeVal < 0) {
      alert('Please enter a valid non-negative delivery charge.');
      return;
    }

    setDeliveryChargeLoading(true);
    setDeliveryChargeMessage('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ deliveryCharge: chargeVal }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedVal = Number(data.deliveryCharge ?? chargeVal);
        setDeliveryCharge(updatedVal);
        setDeliveryChargeInput(String(updatedVal));
        setDeliveryChargeMessage('Delivery charge saved & updated successfully in MongoDB!');
        setTimeout(() => setDeliveryChargeMessage(''), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to update delivery charge in database');
      }
    } catch (err) {
      alert('Network error while updating delivery charge');
    } finally {
      setDeliveryChargeLoading(false);
    }
  };

  // Start editing a product
  const handleStartEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title || '',
      price: String(product.price ?? ''),
      category: product.category || 'men',
      stock: String(product.stock ?? ''),
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.images || ''),
      description: product.description || '',
      deliveryCharge: String(product.deliveryCharge ?? deliveryCharge ?? 120),
    });
  };

  // Save product edits to MongoDB
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const rawImages = (editForm.images || '').trim();
      const imageList = rawImages.includes(',')
        ? rawImages.split(',').map((u) => u.trim()).filter(Boolean)
        : rawImages
        ? [rawImages]
        : editingProduct.images || [];

      const targetId = editingProduct._id || editingProduct.id;
      const finalCategory =
        isEditCustomCategory && editCustomCategoryInput.trim()
          ? editCustomCategoryInput.trim().toLowerCase()
          : editForm.category;

      const res = await fetch(`${apiUrl}/products/${targetId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title.trim(),
          price: Number(editForm.price),
          category: finalCategory,
          stock: Number(editForm.stock),
          images: imageList,
          description: editForm.description.trim(),
          deliveryCharge: editForm.deliveryCharge ? Number(editForm.deliveryCharge) : deliveryCharge,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === targetId ? updated : p))
        );
        setEditingProduct(null);
        setIsEditCustomCategory(false);
        setEditCustomCategoryInput('');
        fetch(`${apiUrl}/products/categories`)
          .then((r) => r.json())
          .then((catData) => {
            if (Array.isArray(catData)) setCategories(catData);
          })
          .catch(() => {});
        alert('Product details updated successfully in MongoDB catalog!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to update product');
      }
    } catch (err: any) {
      alert(err.message || 'Server error during product update');
    } finally {
      setEditLoading(false);
    }
  };

  // Create new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const rawImages = (newProduct.images || '').trim();
      const imageList = rawImages.includes(',')
        ? rawImages.split(',').map((u) => u.trim()).filter(Boolean)
        : rawImages
        ? [rawImages]
        : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=900'];

      const finalCategory =
        isCustomCategory && customCategoryInput.trim()
          ? customCategoryInput.trim().toLowerCase()
          : newProduct.category;

      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: newProduct.title.trim(),
          price: Number(newProduct.price),
          category: finalCategory,
          stock: Number(newProduct.stock),
          images: imageList,
          description: newProduct.description.trim(),
          deliveryCharge: newProduct.deliveryCharge ? Number(newProduct.deliveryCharge) : deliveryCharge,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setProducts([created, ...products]);
        setNewProduct({
          title: '',
          price: '',
          category: 'men',
          stock: '',
          images: '',
          description: '',
          deliveryCharge: '',
        });
        setIsCustomCategory(false);
        setCustomCategoryInput('');
        fetch(`${apiUrl}/products/categories`)
          .then((r) => r.json())
          .then((catData) => {
            if (Array.isArray(catData)) setCategories(catData);
          })
          .catch(() => {});
        alert('Product published and saved to MongoDB catalog!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Product creation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Server error');
    } finally {
      setCreateLoading(false);
    }
  };

  // Confirm and delete product from MongoDB
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    const targetId = deletingProduct._id || deletingProduct.id;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/products/${targetId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== targetId));
        setDeletingProduct(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Delete failed on server');
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.transactionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E50914]" size={36} />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-500">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-2xl font-black uppercase text-white tracking-tight">ACCESS RESTRICTED</h1>
        <p className="text-xs font-mono text-neutral-400 max-w-sm">
          You must be authenticated with Administrator security clearance to access this executive console.
        </p>
        <Link
          href="/login?redirect=/admin/dashboard"
          className="px-6 py-3 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-wider transition"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#E50914] tracking-widest uppercase">
            EXECUTIVE CONTROL PANEL
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            MIRALOU ADMIN SUITE
          </h1>
        </div>

        <button
          onClick={() => fetchAdminData()}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-white text-xs font-mono text-neutral-300 hover:text-white uppercase transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* 1. OVERVIEW ANALYTICS CARDS WITH TIMEFRAME SELECTOR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#181818] border border-neutral-800 p-3.5 rounded-sm">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="p-1.5 bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20 rounded-sm">
              <Calendar size={15} />
            </div>
            <div>
              <span className="font-bold text-white uppercase tracking-wider">Metrics Timeframe:</span>
              <span className="text-neutral-400 text-[11px] ml-2">
                {statsRange === 'weekly' && 'Last 7 Days (এই সপ্তাহ)'}
                {statsRange === 'monthly' && 'Last 30 Days (এই মাস)'}
                {statsRange === 'yearly' && 'Last 365 Days (এই বছর)'}
                {statsRange === 'total' && 'All-Time Lifetime Records (সর্বমোট)'}
              </span>
            </div>
          </div>

          {/* Timeframe pill selector buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#121212] border border-neutral-800 rounded-sm text-xs font-mono">
            {[
              { id: 'weekly', label: 'Weekly', sub: '৭ দিন' },
              { id: 'monthly', label: 'Monthly', sub: '৩০ দিন' },
              { id: 'yearly', label: 'Yearly', sub: '১ বছর' },
              { id: 'total', label: 'Total', sub: 'সর্বমোট' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleRangeChange(tab.id as any)}
                disabled={statsLoading}
                className={`px-3 py-1.5 rounded-sm transition flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  statsRange === tab.id
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] ${
                    statsRange === tab.id ? 'text-white/80' : 'text-neutral-500'
                  }`}
                >
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 7 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 relative">
          {statsLoading && (
            <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-sm">
              <Loader2 className="animate-spin text-[#E50914]" size={26} />
            </div>
          )}
          {[
            {
              label: statsRange === 'total' ? 'TOTAL SALES (BDT)' : `${statsRange.toUpperCase()} SALES (BDT)`,
              val: `৳ ${stats.totalSales.toLocaleString()}`,
              icon: <DollarSign className="text-emerald-500" size={20} />,
            },
            {
              label: statsRange === 'total' ? 'TOTAL USERS' : `NEW USERS (${statsRange.toUpperCase()})`,
              val: stats.totalUsers,
              icon: <Users className="text-blue-500" size={20} />,
            },
            {
              label: statsRange === 'total' ? 'LIFETIME ORDERS' : `${statsRange.toUpperCase()} ORDERS`,
              val: stats.totalOrders,
              icon: <ShoppingBag className="text-purple-500" size={20} />,
            },
            {
              label: 'DELIVERED',
              val: stats.deliveredOrders,
              icon: <CheckCircle className="text-emerald-400" size={20} />,
            },
            {
              label: 'PENDING / PROCESSING',
              val: stats.pendingOrders,
              icon: <Clock className="text-amber-500" size={20} />,
            },
            {
              label: 'TOTAL PAID (৳)',
              val: `৳ ${(stats.totalPaid || 0).toLocaleString()}`,
              icon: <CheckCircle className="text-green-400" size={20} />,
              highlight: 'emerald',
            },
            {
              label: 'TOTAL PENDING (৳)',
              val: `৳ ${(stats.totalPendingAmount || 0).toLocaleString()}`,
              icon: <Clock className="text-orange-400" size={20} />,
              highlight: 'orange',
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-[#181818] border p-5 rounded-sm flex items-center justify-between ${
                (card as any).highlight === 'emerald'
                  ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                  : (card as any).highlight === 'orange'
                  ? 'border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.08)]'
                  : 'border-neutral-800'
              }`}
            >
              <div>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-xl font-black mt-1 text-white font-mono">{card.val}</p>
              </div>
              {card.icon}
            </div>
          ))}
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex space-x-3 border-b border-neutral-800 text-xs font-mono uppercase">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 font-bold transition ${
            activeTab === 'analytics'
              ? 'border-b-2 border-[#E50914] text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Orders Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-bold transition ${
            activeTab === 'users'
              ? 'border-b-2 border-[#E50914] text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          User Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 font-bold transition ${
            activeTab === 'products'
              ? 'border-b-2 border-[#E50914] text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Product Management ({products.length})
        </button>
      </div>

      {/* 3. ORDER MANAGEMENT TABLE */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#181818] border border-neutral-800 p-3 max-w-md">
            <Search size={16} className="text-neutral-500" />
            <input
              type="text"
              placeholder="Filter by Transaction ID or Customer Name..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white outline-none font-mono placeholder:text-neutral-600"
            />
          </div>

          <div className="bg-[#181818] border border-neutral-800 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#121212] text-neutral-400 uppercase border-b border-neutral-800">
                <tr>
                  <th className="p-4">Txn ID</th>
                  <th className="p-4">Customer Credentials</th>
                  <th className="p-4">Items Manifest</th>
                  <th className="p-4">Total (BDT)</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      No order records match the query.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-neutral-900/60 transition">
                      <td className="p-4 font-bold text-neutral-300">{o.transactionId}</td>
                      <td className="p-4">
                        <div className="font-bold text-white font-sans">{o.shippingAddress?.fullName}</div>
                        <div className="text-[11px] text-neutral-400">{o.shippingAddress?.phone}</div>
                        <div className="text-[10px] text-neutral-500">
                          {o.shippingAddress?.district}, {o.shippingAddress?.thana}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {o.items?.map((item: any, i: number) => (
                            <div key={i} className="text-[11px] text-neutral-300">
                              • {item.title} (x{item.quantity}) - {item.selectedSize}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">৳ {o.totalAmount?.toLocaleString()}</td>
                      <td className="p-4">
                        {o.deliveryStatus === 'Cancelled' ? (
                          <span className="px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase text-center bg-neutral-700/40 text-neutral-400 border border-neutral-600/40">
                            Cancelled
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase text-center ${
                                o.paymentStatus === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {o.paymentStatus}
                            </span>
                            <button
                              onClick={() =>
                                handlePaymentStatusChange(
                                  o._id,
                                  o.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                                )
                              }
                              className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider transition ${
                                o.paymentStatus === 'Paid'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              }`}
                            >
                              → Mark {o.paymentStatus === 'Paid' ? 'Pending' : 'Paid'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={o.deliveryStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className="bg-[#121212] border border-neutral-700 px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-[#E50914]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ORDERS TABLE PAGINATION BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 bg-[#121212] border-t border-neutral-800 text-xs font-mono">
              {/* Left: showing count & page size selector */}
              <div className="flex items-center gap-3 text-neutral-400">
                <span>
                  Showing{' '}
                  <strong className="text-white">
                    {filteredOrders.length === 0 ? 0 : (orderPage - 1) * ordersPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-white">
                    {Math.min(orderPage * ordersPerPage, filteredOrders.length)}
                  </strong>{' '}
                  of <strong className="text-[#E50914]">{filteredOrders.length}</strong> orders
                </span>
                <span className="text-neutral-600">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Per page:</span>
                  <select
                    value={ordersPerPage}
                    onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                    className="bg-[#181818] border border-neutral-700 text-white px-2 py-1 rounded-sm outline-none focus:border-[#E50914] cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Right: navigation buttons & numbers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOrderPage(1)}
                  disabled={orderPage === 1}
                  className="px-2.5 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold"
                  title="First Page"
                >
                  « First
                </button>
                <button
                  onClick={() => setOrderPage((p) => Math.max(p - 1, 1))}
                  disabled={orderPage === 1}
                  className="px-3 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold flex items-center gap-1"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalOrderPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalOrderPages ||
                        Math.abs(p - orderPage) <= 1
                    )
                    .map((p, idx, arr) => (
                      <div key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-neutral-500">...</span>
                        )}
                        <button
                          onClick={() => setOrderPage(p)}
                          className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-sm text-[11px] font-bold transition ${
                            orderPage === p
                              ? 'bg-[#E50914] text-white border border-[#E50914] shadow-sm'
                              : 'bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => setOrderPage((p) => Math.min(p + 1, totalOrderPages))}
                  disabled={orderPage === totalOrderPages}
                  className="px-3 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold flex items-center gap-1"
                >
                  Next <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setOrderPage(totalOrderPages)}
                  disabled={orderPage === totalOrderPages}
                  className="px-2.5 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold"
                  title="Last Page"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. USER MANAGEMENT TABLE */}
      {activeTab === 'users' && (() => {
        const filteredUsers = users.filter(
          (u) =>
            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase())
        );
        const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
        const paginatedUsers = filteredUsers.slice(
          (userPage - 1) * usersPerPage,
          userPage * usersPerPage
        );
        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-[#181818] border border-neutral-800 p-3 max-w-md">
              <Search size={16} className="text-neutral-500" />
              <input
                type="text"
                placeholder="Search by Name or Email Address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-white outline-none font-mono placeholder:text-neutral-600"
              />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="text-neutral-500 hover:text-white transition">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="bg-[#181818] border border-neutral-800 rounded-sm overflow-x-auto">
              {/* Table Header Info */}
              <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">User Registry</p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {filteredUsers.length} {userSearch ? 'matching' : 'registered'} member{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#121212] border border-neutral-800 px-2.5 py-1 rounded-sm">
                  Role changes save to MongoDB instantly
                </span>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#121212] text-neutral-400 uppercase border-b border-neutral-800">
                  <tr>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Security Role</th>
                    <th className="p-4">Change Role</th>
                    <th className="p-4">Orders Placed</th>
                    <th className="p-4">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No users match the search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-900/60 transition">
                        <td className="p-4 font-bold text-white font-sans">{u.name}</td>
                        <td className="p-4 text-neutral-400">{u.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm ${
                              u.role === 'admin'
                                ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
                                : u.role === 'editor'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u._id === user?._id ? (
                            <span className="text-[10px] font-mono text-neutral-600 italic">Cannot change own role</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                              className={`bg-[#121212] border px-3 py-1.5 text-xs font-mono font-bold outline-none cursor-pointer transition rounded-sm ${
                                u.role === 'admin'
                                  ? 'border-[#E50914]/50 text-[#E50914] focus:border-[#E50914]'
                                  : u.role === 'editor'
                                  ? 'border-blue-500/50 text-blue-400 focus:border-blue-400'
                                  : 'border-neutral-700 text-neutral-300 focus:border-neutral-500'
                              }`}
                            >
                              <option value="admin">👑 Admin</option>
                              <option value="editor">✏️ Editor</option>
                              <option value="user">👤 User</option>
                            </select>
                          )}
                        </td>
                        <td className="p-4 font-bold text-white">{u.ordersCount || 0} Orders</td>
                        <td className="p-4 text-neutral-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* USERS PAGINATION BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 bg-[#121212] border-t border-neutral-800 text-xs font-mono">
                {/* Left: showing count & page size */}
                <div className="flex items-center gap-3 text-neutral-400">
                  <span>
                    Showing{' '}
                    <strong className="text-white">
                      {filteredUsers.length === 0 ? 0 : (userPage - 1) * usersPerPage + 1}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-white">
                      {Math.min(userPage * usersPerPage, filteredUsers.length)}
                    </strong>{' '}
                    of <strong className="text-[#E50914]">{filteredUsers.length}</strong> users
                  </span>
                  <span className="text-neutral-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400">Per page:</span>
                    <select
                      value={usersPerPage}
                      onChange={(e) => setUsersPerPage(Number(e.target.value))}
                      className="bg-[#181818] border border-neutral-700 text-white px-2 py-1 rounded-sm outline-none focus:border-[#E50914] cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Right: page navigation */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUserPage(1)}
                    disabled={userPage === 1}
                    className="px-2.5 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold"
                  >
                    « First
                  </button>
                  <button
                    onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold flex items-center gap-1"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalUserPages ||
                          Math.abs(p - userPage) <= 1
                      )
                      .map((p, idx, arr) => (
                        <div key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-1 text-neutral-500">...</span>
                          )}
                          <button
                            onClick={() => setUserPage(p)}
                            className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-sm text-[11px] font-bold transition ${
                              userPage === p
                                ? 'bg-[#E50914] text-white border border-[#E50914] shadow-sm'
                                : 'bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => setUserPage((p) => Math.min(p + 1, totalUserPages))}
                    disabled={userPage === totalUserPages}
                    className="px-3 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold flex items-center gap-1"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => setUserPage(totalUserPages)}
                    disabled={userPage === totalUserPages}
                    className="px-2.5 py-1.5 bg-[#181818] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-sm text-[11px] font-bold"
                  >
                    Last »
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. PRODUCT MANAGEMENT & PUBLISHING */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Logistics Setting & Create Product Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* STORE DELIVERY CHARGE MANAGEMENT CARD (ডেলিভারি চার্জ) */}
            <div className="bg-[#181818] border border-neutral-800 p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-[#E50914]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Delivery Charge (ডেলিভারি চার্জ)
                  </h2>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 bg-[#121212] border border-neutral-700 text-emerald-400 font-bold rounded-sm">
                  Active: ৳ {deliveryCharge} BDT
                </span>
              </div>

              <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                Set and edit standard delivery charge across Bangladesh. Updates MongoDB in real time and automatically applies to cart & checkout totals.
              </p>

              <form onSubmit={handleUpdateDeliveryCharge} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1 font-bold">
                    Standard Delivery Fee (৳ BDT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={deliveryChargeInput}
                      onChange={(e) => setDeliveryChargeInput(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full bg-[#121212] border border-neutral-800 p-3 pl-8 text-xs text-white outline-none focus:border-[#E50914] font-mono rounded-sm"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Presets:</span>
                  {[0, 60, 80, 100, 120, 150].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDeliveryChargeInput(String(preset))}
                      className={`px-2.5 py-1 text-[10px] font-mono border rounded-sm transition cursor-pointer ${
                        deliveryChargeInput === String(preset)
                          ? 'border-[#E50914] text-white bg-[#E50914]/20 font-bold'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      {preset === 0 ? 'FREE' : `৳${preset}`}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={deliveryChargeLoading}
                  className="w-full py-3 bg-[#121212] hover:bg-neutral-800 border border-neutral-700 hover:border-[#E50914] text-white font-mono uppercase text-xs transition flex items-center justify-center gap-2 cursor-pointer font-bold rounded-sm shadow-sm"
                >
                  {deliveryChargeLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#E50914]" /> Saving to MongoDB...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-emerald-400" /> Save Delivery Charge
                    </>
                  )}
                </button>

                {deliveryChargeMessage && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{deliveryChargeMessage}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Create Product Form */}
            <form
              onSubmit={handleCreateProduct}
              className="bg-[#181818] border border-neutral-800 p-6 rounded-sm space-y-4"
            >
              <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <Plus size={16} className="text-[#E50914]" /> Publish New Silhouette
              </h2>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Product Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CYBER-RUNNER V4"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                    Price (৳ BDT) *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="14500"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono uppercase text-neutral-400 block">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isCustomCategory;
                        setIsCustomCategory(next);
                        if (!next) {
                          setCustomCategoryInput('');
                        }
                      }}
                      className="text-[11px] font-mono text-[#E50914] hover:underline flex items-center gap-1 font-bold"
                    >
                      {isCustomCategory ? '← Choose Existing' : '+ Custom Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      required
                      type="text"
                      placeholder="e.g. SLIDES, SNEAKERS, BOOTS..."
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setNewProduct({ ...newProduct, category: e.target.value.toLowerCase().trim() });
                      }}
                      className="w-full bg-[#121212] border border-[#E50914] p-3 text-xs text-white outline-none font-mono uppercase rounded-sm"
                      autoFocus
                    />
                  ) : (
                    <select
                      value={newProduct.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                        } else {
                          setNewProduct({ ...newProduct, category: e.target.value });
                        }
                      }}
                      className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914]"
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.slug || c.id}>
                          {c.name || c.slug}
                        </option>
                      ))}
                      <option value="__custom__" className="text-[#E50914] font-bold">
                        + Add Custom Category...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                    Stock Allocation *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                    Delivery Charge (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${deliveryCharge}`}
                    value={newProduct.deliveryCharge}
                    onChange={(e) => setNewProduct({ ...newProduct, deliveryCharge: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Image CDN URL *
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Materials, design features, sole specs..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-3 text-xs text-white outline-none focus:border-[#E50914]"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-4 bg-[#E50914] hover:bg-[#B80710] text-white font-black uppercase tracking-widest text-xs transition"
              >
                {createLoading ? 'Publishing...' : 'Publish To Catalog'}
              </button>
            </form>
          </div>

          {/* Existing Products List */}
          <div className="lg:col-span-7 bg-[#181818] border border-neutral-800 p-6 rounded-sm space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
              Existing Catalog ({products.length})
            </h2>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {products.map((p) => (
                <div
                  key={p._id || p.id}
                  className="flex items-center justify-between p-3 bg-[#121212] border border-neutral-800 rounded-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images?.[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-sm bg-neutral-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{p.title}</p>
                      <p className="text-[11px] font-mono text-neutral-400">
                        ৳ {p.price?.toLocaleString()} · {p.category} · Stock: {p.stock} · <span className="text-emerald-400">Del: ৳{p.deliveryCharge ?? deliveryCharge}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* View Button */}
                    <Link
                      href={`/products/${p._id || p.id}`}
                      target="_blank"
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded text-neutral-300 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono"
                      title="View product in store"
                    >
                      <Eye size={13} className="text-neutral-400" />
                      <span className="hidden sm:inline">View</span>
                    </Link>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(p)}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded text-neutral-300 hover:text-amber-400 transition flex items-center gap-1.5 text-[11px] font-mono"
                      title="Edit product details"
                    >
                      <Pencil size={13} className="text-amber-400" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(p)}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-red-950/40 border border-neutral-800 hover:border-red-500/50 rounded text-neutral-400 hover:text-[#E50914] transition flex items-center gap-1.5 text-[11px] font-mono"
                      title="Delete product"
                    >
                      <Trash2 size={13} className="text-[#E50914]" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 w-full max-w-lg rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#141414]">
              <div className="flex items-center gap-2">
                <Pencil size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Edit Silhouette Manifest
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                  Product Title *
                </label>
                <input
                  required
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                    Price (৳ BDT) *
                  </label>
                  <input
                    required
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-400 block uppercase font-bold text-[10px]">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isEditCustomCategory;
                        setIsEditCustomCategory(next);
                        if (!next) setEditCustomCategoryInput('');
                      }}
                      className="text-[10px] font-mono text-[#E50914] hover:underline font-bold"
                    >
                      {isEditCustomCategory ? '← Existing' : '+ Custom'}
                    </button>
                  </div>

                  {isEditCustomCategory ? (
                    <input
                      required
                      type="text"
                      placeholder="e.g. SLIDES, SNEAKERS..."
                      value={editCustomCategoryInput}
                      onChange={(e) => {
                        setEditCustomCategoryInput(e.target.value);
                        setEditForm({ ...editForm, category: e.target.value.toLowerCase().trim() });
                      }}
                      className="w-full bg-[#121212] border border-[#E50914] p-2.5 text-xs text-white outline-none rounded-sm uppercase font-mono"
                      autoFocus
                    />
                  ) : (
                    <select
                      value={editForm.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsEditCustomCategory(true);
                        } else {
                          setEditForm({ ...editForm, category: e.target.value });
                        }
                      }}
                      className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm font-sans"
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.slug || c.id}>
                          {c.name || c.slug}
                        </option>
                      ))}
                      <option value="__custom__" className="text-[#E50914] font-bold">
                        + Add Custom Category...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                    Stock Quantity (MongoDB) *
                  </label>
                  <input
                    required
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                    Delivery Charge (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${deliveryCharge}`}
                    value={editForm.deliveryCharge}
                    onChange={(e) => setEditForm({ ...editForm, deliveryCharge: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                  Image CDN URLs (comma separated) *
                </label>
                <input
                  required
                  type="text"
                  value={editForm.images}
                  onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm text-[11px]"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase font-bold text-[10px]">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 p-2.5 text-xs text-white outline-none focus:border-[#E50914] rounded-sm font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#B80710] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-red-500/40 w-full max-w-md rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-red-950/20">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-red-400 font-mono">
                  CONFIRM PRODUCT DELETION
                </h3>
              </div>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingProduct(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#121212] border border-neutral-800 rounded">
                <img
                  src={deletingProduct.images?.[0]}
                  alt=""
                  className="w-14 h-14 object-cover rounded bg-neutral-900 border border-neutral-800 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white truncate">{deletingProduct.title}</p>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    ৳ {deletingProduct.price?.toLocaleString()} · {deletingProduct.category}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Stock in MongoDB: {deletingProduct.stock} units
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-300 space-y-1">
                <p className="font-bold uppercase text-[11px] text-red-400 flex items-center gap-1.5">
                  <Trash2 size={13} /> PERMANENT DATABASE REMOVAL
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Are you sure you want to delete this product? It will be permanently removed from MongoDB Atlas catalog and cannot be recovered.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#B80710] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-red-950/50"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
