import React, { useState, useEffect, useCallback } from 'react';
import { 
  Pill, 
  CheckCircle, 
  Search,
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Truck,
  FileImage,
  History,
  Sparkles,
  X,
  Minus,
  Plus
} from 'lucide-react';
import { offlineStorage } from '../utils/offlineStorage';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  price: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  requiresPrescription: boolean;
  category: string;
  description: string;
  sideEffects: string[];
  instructions: string;
  image: string;
  rating: number;
  reviews: number;
}

interface UserReview {
  id: string;
  medicationId: string;
  rating: number;
  comment: string;
  date: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  deliveryAvailable: boolean;
  deliveryFee: number;
  deliveryTime: string;
  isOpen: boolean;
  coordinates: { lat: number; lng: number };
}

interface OrderItem {
  medication: Medication;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  pharmacy: Pharmacy | null;
  deliveryType: 'delivery' | 'pickup';
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
  prescriptionUrl?: string;
}

const STORAGE_KEYS = {
  cart: 'medication_cart',
  wishlist: 'medication_wishlist',
  orders: 'medication_orders',
  reviews: 'medication_reviews',
};

const medications: Medication[] = [
  {
    id: 'med_1',
    name: 'Contraceptive Pills',
    genericName: 'Ethinyl Estradiol + Norgestimate',
    dosage: '21 tablets',
    form: 'Tablet',
    price: 15.99,
    availability: 'in-stock',
    requiresPrescription: true,
    category: 'Contraception',
    description: 'Oral contraceptive pills for birth control',
    sideEffects: ['Nausea', 'Headache', 'Breast tenderness'],
    instructions: 'Take one tablet daily at the same time',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="14" fill="%236b7280" text-anchor="middle" font-family="sans-serif"%3EPill%3C/text%3E%3C/svg%3E',
    rating: 4.5,
    reviews: 128
  },
  {
    id: 'med_2',
    name: 'Emergency Contraception',
    genericName: 'Levonorgestrel',
    dosage: '1.5mg',
    form: 'Tablet',
    price: 25.99,
    availability: 'in-stock',
    requiresPrescription: false,
    category: 'Emergency Contraception',
    description: 'Emergency contraception for unprotected sex',
    sideEffects: ['Nausea', 'Vomiting', 'Fatigue'],
    instructions: 'Take within 72 hours of unprotected sex',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="14" fill="%236b7280" text-anchor="middle" font-family="sans-serif"%3EPill%3C/text%3E%3C/svg%3E',
    rating: 4.3,
    reviews: 89
  },
  {
    id: 'med_3',
    name: 'STI Test Kit',
    genericName: 'Rapid Test Kit',
    dosage: '1 kit',
    form: 'Test Kit',
    price: 35.99,
    availability: 'in-stock',
    requiresPrescription: false,
    category: 'Testing',
    description: 'Home STI testing kit for privacy',
    sideEffects: ['None'],
    instructions: 'Follow instructions in the kit',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="14" fill="%236b7280" text-anchor="middle" font-family="sans-serif"%3EPill%3C/text%3E%3C/svg%3E',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'med_4',
    name: 'Pregnancy Test',
    genericName: 'hCG Test',
    dosage: '2 tests',
    form: 'Test Kit',
    price: 12.99,
    availability: 'in-stock',
    requiresPrescription: false,
    category: 'Testing',
    description: 'Home pregnancy test kit',
    sideEffects: ['None'],
    instructions: 'Use first morning urine for best results',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="14" fill="%236b7280" text-anchor="middle" font-family="sans-serif"%3EPill%3C/text%3E%3C/svg%3E',
    rating: 4.4,
    reviews: 203
  },
  {
    id: 'med_5',
    name: 'Pain Relief',
    genericName: 'Ibuprofen',
    dosage: '200mg',
    form: 'Tablet',
    price: 8.99,
    availability: 'in-stock',
    requiresPrescription: false,
    category: 'Pain Relief',
    description: 'Over-the-counter pain relief medication',
    sideEffects: ['Stomach upset', 'Dizziness'],
    instructions: 'Take with food to avoid stomach upset',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="14" fill="%236b7280" text-anchor="middle" font-family="sans-serif"%3EPill%3C/text%3E%3C/svg%3E',
    rating: 4.2,
    reviews: 312
  }
];

const pharmacies: Pharmacy[] = [
  { id: 'pharm_1', name: 'SafeHealth Pharmacy', address: '123 Main Street, Accra', phone: '+233-24-555-0123', distance: 0.8, rating: 4.6, deliveryAvailable: true, deliveryFee: 5.00, deliveryTime: '30-45 min', isOpen: true, coordinates: { lat: 5.6037, lng: -0.1870 } },
  { id: 'pharm_2', name: 'Liberty Medical Center', address: '456 Broad Street, Accra', phone: '+233-24-555-0456', distance: 1.2, rating: 4.4, deliveryAvailable: true, deliveryFee: 7.00, deliveryTime: '45-60 min', isOpen: true, coordinates: { lat: 5.6137, lng: -0.1970 } },
  { id: 'pharm_3', name: 'Youth Health Pharmacy', address: '789 Oxford Street, Accra', phone: '+233-24-555-0789', distance: 2.1, rating: 4.8, deliveryAvailable: false, deliveryFee: 0, deliveryTime: 'N/A', isOpen: false, coordinates: { lat: 5.6237, lng: -0.2070 } }
];

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Contraception', label: 'Contraception' },
  { value: 'Emergency Contraception', label: 'Emergency' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Pain Relief', label: 'Pain Relief' }
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' }
];

const MedicationOrder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<'browse' | 'checkout' | 'confirmation' | 'history'>('browse');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ medicationId: string; medicationName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadCart = useCallback(async () => {
    const stored = await offlineStorage.getData(STORAGE_KEYS.cart);
    if (Array.isArray(stored)) setCart(stored);
  }, []);

  const saveCart = useCallback(async (items: OrderItem[]) => {
    setCart(items);
    await offlineStorage.storeData(STORAGE_KEYS.cart, items);
  }, []);

  const loadWishlist = useCallback(async () => {
    const stored = await offlineStorage.getData(STORAGE_KEYS.wishlist);
    if (Array.isArray(stored)) setWishlist(stored);
  }, []);

  const loadOrders = useCallback(async () => {
    const stored = await offlineStorage.getData(STORAGE_KEYS.orders);
    if (Array.isArray(stored)) setOrders(stored);
  }, []);

  const loadReviews = useCallback(async () => {
    const stored = await offlineStorage.getData(STORAGE_KEYS.reviews);
    if (Array.isArray(stored)) setUserReviews(stored);
  }, []);

  useEffect(() => { loadCart(); loadWishlist(); loadOrders(); loadReviews(); }, [loadCart, loadWishlist, loadOrders, loadReviews]);

  const filteredMedications = medications
    .filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const addToCart = (medication: Medication) => {
    const existing = cart.find(i => i.medication.id === medication.id);
    const next = existing
      ? cart.map(i => i.medication.id === medication.id ? { ...i, quantity: i.quantity + 1, price: (i.quantity + 1) * medication.price } : i)
      : [...cart, { medication, quantity: 1, price: medication.price }];
    saveCart(next);
  };

  const removeFromCart = (medicationId: string) => saveCart(cart.filter(i => i.medication.id !== medicationId));

  const updateQuantity = (medicationId: string, delta: number) => {
    const item = cart.find(i => i.medication.id === medicationId);
    if (!item) return;
    const q = item.quantity + delta;
    if (q <= 0) removeFromCart(medicationId);
    else saveCart(cart.map(i => i.medication.id === medicationId ? { ...i, quantity: q, price: q * i.medication.price } : i));
  };

  const toggleWishlist = async (medicationId: string) => {
    const next = wishlist.includes(medicationId) ? wishlist.filter(id => id !== medicationId) : [...wishlist, medicationId];
    setWishlist(next);
    await offlineStorage.storeData(STORAGE_KEYS.wishlist, next);
  };

  const getMedicationRating = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    const reviews = userReviews.filter(r => r.medicationId === medId);
    if (reviews.length === 0) return med?.rating ?? 0;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  const getMedicationReviewsCount = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    const userCount = userReviews.filter(r => r.medicationId === medId).length;
    return (med?.reviews ?? 0) + userCount;
  };

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const deliveryFee = deliveryType === 'delivery' && selectedPharmacy?.deliveryAvailable ? selectedPharmacy.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPrescriptionFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    const orderId = `ORD-${Date.now().toString().slice(-8)}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      pharmacy: selectedPharmacy,
      deliveryType,
      total,
      status: 'pending',
      date: new Date().toISOString(),
      prescriptionUrl: prescriptionFile ?? undefined
    };
    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    await offlineStorage.storeData(STORAGE_KEYS.orders, nextOrders);
    saveCart([]);
    setSelectedPharmacy(null);
    setPrescriptionFile(null);
    setCheckoutStep(1);
    setLastOrderId(orderId);
    setView('confirmation');
    setIsOrdering(false);
  };

  const getAvailabilityStyle = (a: string) => {
    if (a === 'in-stock') return 'text-green-600 bg-green-100';
    if (a === 'low-stock') return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      medicationId: reviewModal.medicationId,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString()
    };
    const next = [...userReviews, newReview];
    setUserReviews(next);
    await offlineStorage.storeData(STORAGE_KEYS.reviews, next);
    setReviewModal(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const getStatusStyle = (s: string) => {
    if (s === 'delivered') return 'text-green-600';
    if (s === 'shipped') return 'text-blue-600';
    if (s === 'confirmed') return 'text-amber-600';
    return 'text-gray-600';
  };

  if (view === 'confirmation' && lastOrderId) {
    const order = orders.find(o => o.id === lastOrderId);
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 sm:p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">Your medication order has been placed and will be processed shortly.</p>
            <div className="rounded-xl bg-primary-50/80 border border-primary-200/50 p-4 mb-6 text-left">
              <p className="text-sm font-medium text-primary-900">Order ID: {lastOrderId}</p>
              <p className="text-sm text-primary-700 mt-1">Estimated: {order?.pharmacy?.deliveryTime || 'N/A'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setView('browse'); setLastOrderId(null); }} className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all min-h-[44px]">
                Continue Shopping
              </button>
              <button onClick={() => { setView('history'); setLastOrderId(null); }} className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all min-h-[44px]">
                View Order History
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => setView('browse')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
            ← Back to Shop
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-primary-600" />
            Order History
          </h1>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl bg-white/90 border border-gray-200/80 p-8 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{o.id}</span>
                    <span className={`text-sm font-medium ${getStatusStyle(o.status)}`}>{o.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{new Date(o.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700">{o.items.length} item(s) • ${o.total.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'checkout') {
    const needsPrescription = cart.some(i => i.medication.requiresPrescription);
    const canPlace = cart.length > 0 && selectedPharmacy && (!needsPrescription || prescriptionFile);

    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => setView('browse')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
            ← Back to Cart
          </button>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${checkoutStep >= s ? 'bg-primary-500' : 'bg-gray-200'}`} />
            ))}
          </div>

          {checkoutStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Select Pharmacy & Delivery</h2>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setDeliveryType('delivery')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${deliveryType === 'delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <Truck className="w-5 h-5" />
                  Delivery
                </button>
                <button onClick={() => setDeliveryType('pickup')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${deliveryType === 'pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <MapPin className="w-5 h-5" />
                  Pickup
                </button>
              </div>
              <div className="space-y-3">
                {pharmacies.map(p => (
                  <button key={p.id} onClick={() => setSelectedPharmacy(p)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedPharmacy?.id === p.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.address}</p>
                        <p className="text-xs text-gray-500 mt-1">{p.distance} km • {p.isOpen ? 'Open' : 'Closed'}</p>
                      </div>
                      {p.deliveryAvailable && deliveryType === 'delivery' && <p className="text-sm font-medium">${p.deliveryFee} • {p.deliveryTime}</p>}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setCheckoutStep(2)} disabled={!selectedPharmacy} className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 min-h-[44px]">
                Continue
              </button>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Prescription (if required)</h2>
              {needsPrescription && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-4">
                  <p className="text-sm text-amber-800 mb-3">Some items require a prescription. Upload an image of your prescription.</p>
                  <label className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <FileImage className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">{prescriptionFile ? 'Change file' : 'Upload prescription'}</span>
                    <input type="file" accept="image/*" onChange={handlePrescriptionUpload} className="hidden" />
                  </label>
                  {prescriptionFile && <p className="text-xs text-amber-700 mt-2">✓ Prescription uploaded</p>}
                </div>
              )}
              {!needsPrescription && <p className="text-sm text-gray-500">No prescription required for your items.</p>}
              <div className="flex gap-3">
                <button onClick={() => setCheckoutStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">
                  Back
                </button>
                <button onClick={() => setCheckoutStep(3)} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium">
                  Continue
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Review & Place Order</h2>
              <div className="rounded-2xl bg-white/90 border border-gray-200/80 p-4 space-y-2">
                {cart.map(i => (
                  <div key={i.medication.id} className="flex justify-between text-sm">
                    <span>{i.medication.name} × {i.quantity}</span>
                    <span>${i.price.toFixed(2)}</span>
                  </div>
                ))}
                {deliveryFee > 0 && <div className="flex justify-between text-sm pt-2 border-t"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={!canPlace || isOrdering} className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 min-h-[44px]">
                {isOrdering ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 mb-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white">Order Medicine</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Order Medicine</h1>
              <p className="text-sm text-white/90">Browse, add to cart, and order medications from trusted pharmacies.</p>
            </div>
          </div>
        </div>

        {/* Search, filters, sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search medications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.value} onClick={() => setSelectedCategory(c.value)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === c.value ? 'bg-primary-500 text-white' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:border-primary-200'}`}>
                {c.label}
              </button>
            ))}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm bg-white">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Cart button - floating */}
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40">
          <button onClick={() => setCartOpen(true)} className="relative p-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center min-h-[44px] min-w-[44px]">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-primary-600 rounded-full text-xs font-bold flex items-center justify-center">{cart.length}</span>}
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.map(med => (
            <div key={med.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              <div className="aspect-square bg-gray-100 relative">
                <img src={med.image} alt="" className="w-full h-full object-cover" />
                <button onClick={() => toggleWishlist(med.id)} className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                  <Heart className={`w-4 h-4 ${wishlist.includes(med.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{med.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{med.genericName} • {med.dosage}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(getMedicationRating(med.id)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                    </div>
                    <span className="text-xs text-gray-500">({getMedicationReviewsCount(med.id)})</span>
                  </div>
                  <button onClick={() => setReviewModal({ medicationId: med.id, medicationName: med.name })} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Review
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${getAvailabilityStyle(med.availability)}`}>
                    {med.availability === 'in-stock' ? 'In Stock' : med.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                  {med.requiresPrescription && <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">Rx</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${med.price}</span>
                  <button onClick={() => addToCart(med)} disabled={med.availability === 'out-of-stock'} className="py-2 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[36px]">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => setView('history')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-gray-200/80 hover:border-primary-200 text-sm font-medium">
            <History className="w-4 h-4" />
            Order History
          </button>
        </div>
      </main>

      {/* Cart drawer / bottom sheet */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setCartOpen(false)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Your Cart ({cart.length})</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.medication.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img src={item.medication.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.medication.name}</p>
                      <p className="text-xs text-gray-500">${item.medication.price} each</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.medication.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center min-h-[44px] min-w-[44px]"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.medication.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center min-h-[44px] min-w-[44px]"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => removeFromCart(item.medication.id)} className="text-red-500 text-xs ml-2">Remove</button>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <button onClick={() => { setCartOpen(false); setView('checkout'); setCheckoutStep(1); }} className="w-full py-3 mt-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium min-h-[44px]">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-2">Review: {reviewModal.medicationName}</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setReviewRating(i)} className="p-1">
                  <Star className={`w-6 h-6 ${i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Your review (optional)" className="w-full p-3 rounded-xl border border-gray-200 text-sm mb-4 min-h-[80px]" />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
              <button onClick={submitReview} className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationOrder;
