'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  Pencil,
  X,
  Package,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EditorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Active Editor View: strictly Orders Queue and Product Management
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [loading, setLoading] = useState(true);

  // Delivery Charge State (Saved to MongoDB)
  const [deliveryCharge, setDeliveryCharge] = useState<number>(120);
  const [deliveryChargeInput, setDeliveryChargeInput] = useState<string>('120');
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);
  const [deliveryChargeMessage, setDeliveryChargeMessage] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Orders and Products state
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Search & Orders Pagination state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(5);

  // Search & Product filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [productPage, setProductPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(8);

  // Create Product Modal & Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'men',
    stock: '50',
    images: '',
    description: '',
    deliveryCharge: '120',
  });

  // Edit Product Modal & Form state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditCustomCategory, setIsEditCustomCategory] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: 'men',
    stock: '',
    images: '',
    description: '',
    deliveryCharge: '120',
  });

  // Delete Product Confirmation state
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch Editor Data (Orders, Products, Categories)
  const fetchEditorData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('miralou_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [ordersRes, prodsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/orders`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/products?limit=500`, { cache: 'no-store' }),
        fetch(`${apiUrl}/products/categories`, { cache: 'no-store' }),
        fetch(`${apiUrl}/settings`, { cache: 'no-store' }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
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
      console.error('Editor data fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Store Delivery Charge
  const handleUpdateDeliveryCharge = async (e: React.FormEvent) => {
    e.preventDefault();
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
        body: JSON.stringify({ deliveryCharge: Number(deliveryChargeInput) }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = Number(data.deliveryCharge);
        setDeliveryCharge(updated);
        setDeliveryChargeInput(String(updated));
        setDeliveryChargeMessage(`Delivery fee updated to ৳ ${updated} BDT successfully!`);
        setTimeout(() => setDeliveryChargeMessage(''), 3500);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to update delivery fee');
      }
    } catch (err: any) {
      alert(err.message || 'Server error updating delivery charge');
    } finally {
      setDeliveryChargeLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (user.role === 'editor' || user.role === 'admin')) {
      fetchEditorData();
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
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not update delivery status in database');
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
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Could not update payment status');
      }
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  // Start editing product
  const handleStartEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title || '',
      price: String(product.price ?? ''),
      category: product.category || 'men',
      stock: String(product.stock ?? '50'),
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.images || ''),
      description: product.description || '',
      deliveryCharge: String(product.deliveryCharge ?? 120),
    });
  };

  // Save edited product
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
          deliveryCharge: Number(editForm.deliveryCharge) || 120,
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
        alert('Product details updated successfully in catalog!');
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
          deliveryCharge: Number(newProduct.deliveryCharge) || 120,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setProducts([created, ...products]);
        setNewProduct({
          title: '',
          price: '',
          category: 'men',
          stock: '50',
          images: '',
          description: '',
          deliveryCharge: '120',
        });
        setShowCreateModal(false);
        setIsCustomCategory(false);
        setCustomCategoryInput('');
        alert('New product published successfully to catalog!');
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

  // Delete product
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

  // Filtered Orders
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

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat =
      selectedCategoryFilter === 'all' ||
      p.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage
  );

  // Orders summary stats
  const pendingCount = orders.filter((o) => ['Pending', 'Processing'].includes(o.deliveryStatus)).length;
  const deliveredCount = orders.filter((o) => o.deliveryStatus === 'Delivered').length;

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E50914]" size={36} />
      </div>
    );
  }

  // Access control: only editor and admin roles allowed
  if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-500">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-2xl font-black uppercase text-white tracking-tight">ACCESS RESTRICTED</h1>
        <p className="text-xs font-mono text-neutral-400 max-w-sm">
          You must be authenticated with Editor or Admin security clearance to access this console.
        </p>
        <Link
          href="/login?redirect=/editor/dashboard"
          className="px-6 py-3 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold uppercase tracking-wider transition rounded-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-sm">
              ✏️ Editor Console
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Orders Queue & Product Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
            MIRALOU EDITOR SUITE
          </h1>
        </div>

        <button
          onClick={() => fetchEditorData()}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white uppercase transition rounded-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* Editor Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-neutral-800 p-4 rounded-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between gap-1 w-full">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">LIFETIME ORDERS</p>
            <div className="p-1 rounded-full bg-white/5 text-purple-400">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-xl font-black mt-2 text-white font-mono">{orders.length}</p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 p-4 rounded-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between gap-1 w-full">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">PENDING / PROCESSING</p>
            <div className="p-1 rounded-full bg-white/5 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-xl font-black mt-2 text-white font-mono">{pendingCount}</p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 p-4 rounded-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between gap-1 w-full">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">DELIVERED ORDERS</p>
            <div className="p-1 rounded-full bg-white/5 text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="text-xl font-black mt-2 text-white font-mono">{deliveredCount}</p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 p-4 rounded-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between gap-1 w-full">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">CATALOG PRODUCTS</p>
            <div className="p-1 rounded-full bg-white/5 text-blue-400">
              <Package size={18} />
            </div>
          </div>
          <p className="text-xl font-black mt-2 text-white font-mono">{products.length}</p>
        </div>
      </div>

      {/* Navigation Tabs (Orders Queue & Product Management only) */}
      <div className="flex space-x-8 border-b border-neutral-300 dark:border-neutral-800 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`relative pb-3 text-xs tracking-wider transition-all duration-150 ${
            activeTab === 'orders'
              ? 'text-[#E50914] font-black tab-btn-active'
              : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white tab-btn-inactive font-bold'
          }`}
        >
          Orders Queue ({orders.length})
          {activeTab === 'orders' && (
            <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,1)] rounded-full animate-in fade-in" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`relative pb-3 text-xs tracking-wider transition-all duration-150 ${
            activeTab === 'products'
              ? 'text-[#E50914] font-black tab-btn-active'
              : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white tab-btn-inactive font-bold'
          }`}
        >
          Product Management ({products.length})
          {activeTab === 'products' && (
            <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,1)] rounded-full animate-in fade-in" />
          )}
        </button>
      </div>

      {/* 1. ORDERS QUEUE VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#181818] border border-neutral-800 p-3 max-w-md rounded-sm">
            <Search size={16} className="text-neutral-500" />
            <input
              type="text"
              placeholder="Filter by Transaction ID or Customer Name..."
              value={orderSearch}
              onChange={(e) => {
                setOrderSearch(e.target.value);
                setOrderPage(1);
              }}
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
                  paginatedOrders.map((o) => {
                    const isCancelled = o.deliveryStatus === 'Cancelled';
                    return (
                      <tr
                        key={o._id}
                        className="transition-colors duration-150 hover:bg-blue-500/10 dark:hover:bg-neutral-800/60"
                      >
                        <td className="p-4 font-bold text-neutral-300">
                          {o.transactionId}
                        </td>
                        <td className="p-4">
                          <div className="font-bold font-sans text-white">
                            {o.shippingAddress?.fullName}
                          </div>
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
                        <td className="p-4 font-bold text-white">
                          ৳ {o.totalAmount?.toLocaleString()}
                        </td>
                        <td className="p-4">
                          {isCancelled ? (
                            <span className="px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase text-center bg-neutral-800 text-neutral-400 border border-neutral-700 inline-block">
                              CANCELLED
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
                            className="px-3 py-1.5 text-xs outline-none font-mono rounded-sm transition bg-[#121212] border border-neutral-700 text-white focus:border-[#ff6b00]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 bg-[#121212] border-t border-neutral-800 text-xs font-mono">
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
                    onChange={(e) => {
                      setOrdersPerPage(Number(e.target.value));
                      setOrderPage(1);
                    }}
                    className="bg-[#181818] border border-neutral-700 text-white px-2 py-1 rounded-sm outline-none focus:border-[#E50914] cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOrderPage(1)}
                  disabled={orderPage === 1}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  « First
                </button>
                <button
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  disabled={orderPage === 1}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setOrderPage(p)}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-sm text-[11px] font-black transition ${
                      orderPage === p
                        ? 'bg-[#ff6b00] text-white border border-[#ff6b00] shadow-md shadow-[#ff6b00]/30'
                        : 'bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                  disabled={orderPage === totalOrderPages}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  Next ›
                </button>
                <button
                  onClick={() => setOrderPage(totalOrderPages)}
                  disabled={orderPage === totalOrderPages}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCT MANAGEMENT VIEW */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181818] border border-neutral-800 p-4 rounded-sm">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search Product */}
              <div className="flex items-center gap-2 bg-[#121212] border border-neutral-700 px-3 py-2 rounded-sm w-full sm:w-72">
                <Search size={14} className="text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search drops by title or tag..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setProductPage(1);
                  }}
                  className="w-full bg-transparent border-none text-xs text-white outline-none font-mono placeholder:text-neutral-600"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-neutral-500" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setProductPage(1);
                  }}
                  className="bg-[#121212] border border-neutral-700 text-white px-3 py-2 text-xs font-mono rounded-sm outline-none cursor-pointer"
                >
                  <option value="all">ALL CATEGORIES</option>
                  <option value="men">MEN</option>
                  <option value="women">WOMEN</option>
                  <option value="kids">KIDS</option>
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Create Drop Button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-sm shadow-md transition whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} /> Deploy New Drop
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-[#181818] border border-neutral-800 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#121212] text-neutral-400 uppercase border-b border-neutral-800">
                <tr>
                  <th className="p-4">Drop Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      No products match this query.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const firstImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.images;
                    return (
                      <tr key={p._id || p.id} className="hover:bg-blue-500/10 dark:hover:bg-neutral-800/60 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={firstImg || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100'}
                            alt={p.title}
                            className="w-12 h-12 object-cover rounded-sm border border-neutral-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold font-sans text-white text-sm line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-mono">ID: {p._id || p.id}</p>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-neutral-300">
                          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-sm text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">৳ {Number(p.price).toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              p.stock > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {p.stock > 0 ? `${p.stock} in Vault` : 'SOLD OUT'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition"
                              title="Edit Drop"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded-sm transition"
                              title="Delete Drop"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Products Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 bg-[#121212] border-t border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400">
                Showing <strong className="text-white">{filteredProducts.length === 0 ? 0 : (productPage - 1) * productsPerPage + 1}</strong> to{' '}
                <strong className="text-white">{Math.min(productPage * productsPerPage, filteredProducts.length)}</strong> of{' '}
                <strong className="text-[#E50914]">{filteredProducts.length}</strong> catalog items
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setProductPage(1)}
                  disabled={productPage === 1}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  « First
                </button>
                <button
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  disabled={productPage === 1}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProductPage(p)}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-sm text-[11px] font-black transition ${
                      productPage === p
                        ? 'bg-[#ff6b00] text-white border border-[#ff6b00] shadow-md shadow-[#ff6b00]/30'
                        : 'bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                  disabled={productPage === totalProductPages}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  Next ›
                </button>
                <button
                  onClick={() => setProductPage(totalProductPages)}
                  disabled={productPage === totalProductPages}
                  className="px-2 py-1 bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded-sm"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 w-full max-w-2xl rounded-sm p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black uppercase text-white font-mono">Deploy New Drop Item</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CYBER-STREET PHANTOM RED"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="18500"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Delivery Charge (৳ BDT)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="120"
                    value={newProduct.deliveryCharge}
                    onChange={(e) => setNewProduct({ ...newProduct, deliveryCharge: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[0, 60, 80, 100, 120].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, deliveryCharge: String(preset) })}
                        className={`px-1.5 py-0.5 text-[10px] font-mono border rounded-sm transition ${
                          newProduct.deliveryCharge === String(preset)
                            ? 'border-[#E50914] text-white bg-[#E50914]/20 font-bold'
                            : 'border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {preset === 0 ? 'FREE' : `৳${preset}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Category</label>
                {!isCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={newProduct.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                        } else {
                          setNewProduct({ ...newProduct, category: e.target.value });
                        }
                      }}
                      className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                    >
                      <option value="men">MEN</option>
                      <option value="women">WOMEN</option>
                      <option value="kids">KIDS</option>
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name.toUpperCase()}
                        </option>
                      ))}
                      <option value="__custom__">+ Enter Custom Category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type new category..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-3 bg-neutral-800 text-neutral-300 hover:text-white rounded-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Image URLs (comma-separated)</label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/..., https://..."
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Streetwear drop detailed narrative..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold rounded-sm disabled:opacity-50"
                >
                  {createLoading && <Loader2 size={14} className="animate-spin" />} Save & Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-700 w-full max-w-2xl rounded-sm p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black uppercase text-white font-mono">Edit Drop Item</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Delivery Charge (৳ BDT)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="120"
                    value={editForm.deliveryCharge}
                    onChange={(e) => setEditForm({ ...editForm, deliveryCharge: e.target.value })}
                    className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                  />
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[0, 60, 80, 100, 120].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, deliveryCharge: String(preset) })}
                        className={`px-1.5 py-0.5 text-[10px] font-mono border rounded-sm transition ${
                          editForm.deliveryCharge === String(preset)
                            ? 'border-[#E50914] text-white bg-[#E50914]/20 font-bold'
                            : 'border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {preset === 0 ? 'FREE' : `৳${preset}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Category</label>
                {!isEditCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={editForm.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsEditCustomCategory(true);
                        } else {
                          setEditForm({ ...editForm, category: e.target.value });
                        }
                      }}
                      className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                    >
                      <option value="men">MEN</option>
                      <option value="women">WOMEN</option>
                      <option value="kids">KIDS</option>
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name.toUpperCase()}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom Category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type category..."
                      value={editCustomCategoryInput}
                      onChange={(e) => setEditCustomCategoryInput(e.target.value)}
                      className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditCustomCategory(false)}
                      className="px-3 bg-neutral-800 text-neutral-300 hover:text-white rounded-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Image URLs (comma-separated)</label>
                <textarea
                  rows={2}
                  value={editForm.images}
                  onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-700 p-2.5 text-white rounded-sm outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold rounded-sm disabled:opacity-50"
                >
                  {editLoading && <Loader2 size={14} className="animate-spin" />} Update Drop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-red-500/50 w-full max-w-md rounded-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase font-mono">Delete Product?</h3>
            <p className="text-xs text-neutral-400 font-mono">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{deletingProduct.title}"</strong> from the catalog? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono uppercase rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase rounded-sm disabled:opacity-50"
              >
                {deleteLoading && <Loader2 size={14} className="animate-spin" />} Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
