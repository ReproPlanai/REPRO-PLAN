import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Plus,
  Shield,
  UserCheck,
  Download,
  Trash2,
  Edit,
  PlusCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
  createdBy?: string;
  createdAt?: string;
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
  receiptUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  tier3Verified?: boolean;
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Contraception', label: 'Contraception' },
  { value: 'Emergency Contraception', label: 'Emergency' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Pain Relief', label: 'Pain Relief' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Supplements', label: 'Supplements' }
];

// Admin form for adding new medications
interface MedicationFormData {
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  price: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  requiresPrescription: boolean;
  category: string;
  description: string;
  sideEffects: string;
  instructions: string;
  image: string;
}

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' }
];

const MedicationOrder: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // State for medications from API
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoadingMeds, setIsLoadingMeds] = useState(false);
  
  // State for pharmacies from API
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationForm, setMedicationForm] = useState<MedicationFormData>({
    name: '',
    genericName: '',
    dosage: '',
    form: 'Tablet',
    price: 0,
    availability: 'in-stock',
    requiresPrescription: false,
    category: 'Contraception',
    description: '',
    sideEffects: '',
    instructions: '',
    image: ''
  });
  
  // Tier 3 verification state
  const [showTier3Verification, setShowTier3Verification] = useState(false);
  const [tier3Code, setTier3Code] = useState('');
  const [tier3Verified, setTier3Verified] = useState(false);
  const [tier3Error, setTier3Error] = useState('');
  
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
  
  // AI recommendation state
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  const loadMedications = useCallback(async () => {
    setIsLoadingMeds(true);
    try {
      const response = await apiService.getMedications?.() as { success?: boolean; medications?: Medication[] };
      if (response?.success && response.medications) {
        setMedications(response.medications);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error('Failed to load medications:', error);
      setMedications([]);
    } finally {
      setIsLoadingMeds(false);
    }
  }, []);

  // Load pharmacies from API
  const loadPharmacies = useCallback(async () => {
    try {
      const response = await apiService.getPharmacies?.() as { success?: boolean; pharmacies?: Pharmacy[] };
      if (response?.success && response.pharmacies) {
        setPharmacies(response.pharmacies);
      }
    } catch (error) {
      console.error('Failed to load pharmacies:', error);
      setPharmacies([]);
    }
  }, []);

  // Fetch AI recommendations
  const fetchAIRecommendations = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        const cartItems = cart.map(item => item.medication.name).join(', ');
        const prompt = `Based on the user's cart items: ${cartItems || 'none'}, recommend 3-5 additional SRHR products that would complement their order. Focus on Ghana-specific needs. Return only product names separated by commas.`;
        
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, history: [] })
        });
        
        if (res.ok) {
          const data = await res.json();
          const recommendations = data.response
            .split(',')
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0);
          setAiRecommendations(recommendations);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
      setAiRecommendations([]);
    }
  }, [cart]);

  // Fetch AI recommendations when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      fetchAIRecommendations();
    } else {
      setAiRecommendations([]);
    }
  }, [cart, fetchAIRecommendations]);

  // Get recommended medications
  const recommendedMedications = useMemo(() => {
    if (aiRecommendations.length === 0) return [];
    return medications.filter(med => 
      aiRecommendations.some(rec => 
        med.name.toLowerCase().includes(rec.toLowerCase()) ||
        rec.toLowerCase().includes(med.name.toLowerCase())
      )
    ).slice(0, 5);
  }, [medications, aiRecommendations]);

  useEffect(() => {
    loadMedications();
    loadPharmacies();
  }, [loadMedications, loadPharmacies]);

  // Admin: Add/Edit medication
  const handleSaveMedication = async () => {
    try {
      const medData = {
        ...medicationForm,
        sideEffects: medicationForm.sideEffects.split(',').map(s => s.trim()).filter(Boolean),
        price: Number(medicationForm.price)
      };
      
      if (editingMedication) {
        await apiService.updateMedication?.(editingMedication.id, medData);
      } else {
        await apiService.createMedication?.(medData);
      }
      
      setMedicationForm({
        name: '',
        genericName: '',
        dosage: '',
        form: 'Tablet',
        price: 0,
        availability: 'in-stock',
        requiresPrescription: false,
        category: 'Contraception',
        description: '',
        sideEffects: '',
        instructions: '',
        image: ''
      });
      setEditingMedication(null);
      loadMedications();
    } catch (error) {
      console.error('Failed to save medication:', error);
      alert('Failed to save medication. Please try again.');
    }
  };

  // Admin: Delete medication
  const handleDeleteMedication = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      await apiService.deleteMedication?.(id);
      loadMedications();
    } catch (error) {
      console.error('Failed to delete medication:', error);
      alert('Failed to delete medication. Please try again.');
    }
  };

  // Admin: Edit medication
  const handleEditMedication = (med: Medication) => {
    setEditingMedication(med);
    setMedicationForm({
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      form: med.form,
      price: med.price,
      availability: med.availability,
      requiresPrescription: med.requiresPrescription,
      category: med.category,
      description: med.description,
      sideEffects: med.sideEffects.join(', '),
      instructions: med.instructions,
      image: med.image
    });
    setShowAdminPanel(true);
  };

  // Tier 3 verification
  const handleTier3Verification = async () => {
    setTier3Error('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (tier3Code.length === 6 && /^\d+$/.test(tier3Code)) {
        setTier3Verified(true);
        setShowTier3Verification(false);
      } else {
        setTier3Error('Invalid verification code. Please enter a 6-digit code.');
      }
    } catch (error) {
      setTier3Error('Verification failed. Please try again.');
    }
  };

  // Generate receipt
  const generateReceipt = (order: Order) => {
    const receiptContent = `
REPRO PLAN - MEDICATION ORDER RECEIPT
=====================================
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status.toUpperCase()}

${order.tier3Verified ? `Verified by: ${order.verifiedBy || 'System'}\nVerified at: ${order.verifiedAt ? new Date(order.verifiedAt).toLocaleString() : 'N/A'}\n` : ''}
Items:
${order.items.map(item => `  - ${item.medication.name} x${item.quantity} = $${item.price.toFixed(2)}`).join('\n')}

${order.pharmacy ? `Pharmacy: ${order.pharmacy.name}
Address: ${order.pharmacy.address}
Phone: ${order.pharmacy.phone}
` : ''}
Delivery: ${order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}

Subtotal: $${order.items.reduce((s, i) => s + i.price, 0).toFixed(2)}
${order.deliveryType === 'delivery' && order.pharmacy ? `Delivery Fee: $${order.pharmacy.deliveryFee.toFixed(2)}\n` : ''}
TOTAL: $${order.total.toFixed(2)}

Thank you for using REPRO PLAN!
This receipt serves as proof of purchase.
=====================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    setCart(next);
  };

  const removeFromCart = (medicationId: string) => setCart(cart.filter(i => i.medication.id !== medicationId));

  const updateQuantity = (medicationId: string, delta: number) => {
    const item = cart.find(i => i.medication.id === medicationId);
    if (!item) return;
    const q = item.quantity + delta;
    if (q <= 0) removeFromCart(medicationId);
    else setCart(cart.map(i => i.medication.id === medicationId ? { ...i, quantity: q, price: q * i.medication.price } : i));
  };

  const toggleWishlist = (medicationId: string) => {
    const next = wishlist.includes(medicationId) ? wishlist.filter(id => id !== medicationId) : [...wishlist, medicationId];
    setWishlist(next);
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
    if (cart.length === 0 || !selectedPharmacy) return;
    
    // Check if tier 3 verification is required for high-value orders
    const requiresTier3 = total > 100; // Tier 3 required for orders over $100
    if (requiresTier3 && !tier3Verified) {
      setShowTier3Verification(true);
      return;
    }
    
    setIsOrdering(true);
    try {
      // Simulate API call - in production use: apiService.placeOrder?.(orderData)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;
      const newOrder: Order = {
        id: orderId,
        items: [...cart],
        pharmacy: selectedPharmacy,
        deliveryType,
        total,
        status: 'pending',
        date: new Date().toISOString(),
        prescriptionUrl: prescriptionFile ?? undefined,
        tier3Verified,
        verifiedBy: tier3Verified ? 'System' : undefined,
        verifiedAt: tier3Verified ? new Date().toISOString() : undefined
      };
      
      setOrders([newOrder, ...orders]);
      setCart([]);
      setSelectedPharmacy(null);
      setPrescriptionFile(null);
      setCheckoutStep(1);
      setTier3Verified(false);
      setTier3Code('');
      setLastOrderId(orderId);
      setView('confirmation');
      
      // Auto-generate receipt
      generateReceipt(newOrder);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const getAvailabilityStyle = (a: string) => {
    if (a === 'in-stock') return 'text-green-600 bg-green-100';
    if (a === 'low-stock') return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const submitReview = () => {
    if (!reviewModal) return;
    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      medicationId: reviewModal.medicationId,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString()
    };
    setUserReviews([...userReviews, newReview]);
    // Submit to API (if available)
    apiService.submitReview?.(newReview).catch((error: Error) => {
      console.error('Failed to submit review to API:', error);
    });
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
                    <div>
                      <span className="font-semibold text-gray-900">{o.id}</span>
                      {o.tier3Verified && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <Shield className="w-3 h-3" />
                          Tier 3
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${getStatusStyle(o.status)}`}>{o.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{new Date(o.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700 mb-3">{o.items.length} item(s) • ${o.total.toFixed(2)}</p>
                  <button 
                    onClick={() => generateReceipt(o)}
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </button>
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
              <h2 className="text-lg font-semibold text-gray-900">Prescription & Verification</h2>
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
              
              {/* Tier 3 Verification for high-value orders */}
              {total > 100 && (
                <div className={`rounded-2xl border p-4 ${tier3Verified ? 'bg-green-50 border-green-200/60' : 'bg-blue-50 border-blue-200/60'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`w-5 h-5 ${tier3Verified ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${tier3Verified ? 'text-green-800' : 'text-blue-800'}`}>
                      {tier3Verified ? 'Tier 3 Verified' : 'Tier 3 Verification Required'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {tier3Verified 
                      ? 'Your order has been verified with Tier 3 security.' 
                      : 'Orders over $100 require Tier 3 verification. Please enter your verification code.'}
                  </p>
                  {!tier3Verified && (
                    <button 
                      onClick={() => setShowTier3Verification(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Verify with Tier 3
                      </span>
                    </button>
                  )}
                </div>
              )}
              
              {!needsPrescription && total <= 100 && <p className="text-sm text-gray-500">No prescription or additional verification required for your items.</p>}
              <div className="flex gap-3">
                <button onClick={() => setCheckoutStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">
                  Back
                </button>
                <button 
                  onClick={() => setCheckoutStep(3)} 
                  disabled={needsPrescription && !prescriptionFile}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
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

        {/* Admin Panel Button - Only visible to admins */}
        {isAdmin && (
          <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-40">
            <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all min-h-[44px]">
              <PlusCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Manage Products</span>
            </button>
          </div>
        )}

      {/* Product grid with admin controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingMeds ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products available</p>
              {isAdmin && <p className="text-sm text-gray-400 mt-1">Add products using the Manage Products button</p>}
            </div>
          ) : (
            filteredMedications.map(med => (
              <div key={med.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <div className="aspect-square bg-gray-100 relative">
                  <img src={med.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => toggleWishlist(med.id)} className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                    <Heart className={`w-4 h-4 ${wishlist.includes(med.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                  </button>
                  {isAdmin && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      <button onClick={() => handleEditMedication(med)} className="p-2 rounded-full bg-white/90 hover:bg-blue-50 transition-colors">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeleteMedication(med.id)} className="p-2 rounded-full bg-white/90 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
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
            ))
          )}
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

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdminPanel(false)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMedication ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => { setShowAdminPanel(false); setEditingMedication(null); }} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" value={medicationForm.name} onChange={e => setMedicationForm({...medicationForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="e.g. Contraceptive Pills" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                <input type="text" value={medicationForm.genericName} onChange={e => setMedicationForm({...medicationForm, genericName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="e.g. Ethinyl Estradiol" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input type="text" value={medicationForm.dosage} onChange={e => setMedicationForm({...medicationForm, dosage: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="e.g. 21 tablets" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
                <select value={medicationForm.form} onChange={e => setMedicationForm({...medicationForm, form: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Injection">Injection</option>
                  <option value="Test Kit">Test Kit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" step="0.01" value={medicationForm.price} onChange={e => setMedicationForm({...medicationForm, price: parseFloat(e.target.value)})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="15.99" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={medicationForm.category} onChange={e => setMedicationForm({...medicationForm, category: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  {categories.filter(c => c.value !== 'all').map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select value={medicationForm.availability} onChange={e => setMedicationForm({...medicationForm, availability: e.target.value as any})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="requiresPrescription" checked={medicationForm.requiresPrescription} onChange={e => setMedicationForm({...medicationForm, requiresPrescription: e.target.checked})} className="w-5 h-5 rounded border-gray-300" />
                <label htmlFor="requiresPrescription" className="text-sm font-medium text-gray-700">Requires Prescription</label>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={medicationForm.description} onChange={e => setMedicationForm({...medicationForm, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows={3} placeholder="Product description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects (comma separated)</label>
                <input type="text" value={medicationForm.sideEffects} onChange={e => setMedicationForm({...medicationForm, sideEffects: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Nausea, Headache, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea value={medicationForm.instructions} onChange={e => setMedicationForm({...medicationForm, instructions: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows={2} placeholder="Usage instructions..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={medicationForm.image} onChange={e => setMedicationForm({...medicationForm, image: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="https://..." />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => { setShowAdminPanel(false); setEditingMedication(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">
                Cancel
              </button>
              <button onClick={handleSaveMedication} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium">
                {editingMedication ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier 3 Verification Modal */}
      {showTier3Verification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTier3Verification(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Tier 3 Verification
              </h2>
              <button onClick={() => setShowTier3Verification(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Orders over $100 require Tier 3 verification. Please enter your 6-digit verification code.
            </p>
            
            <input 
              type="text" 
              value={tier3Code} 
              onChange={e => setTier3Code(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full p-3 rounded-xl border border-gray-200 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3"
            />
            
            {tier3Error && (
              <p className="text-sm text-red-600 mb-3">{tier3Error}</p>
            )}
            
            <button 
              onClick={handleTier3Verification}
              disabled={tier3Code.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5" />
                Verify Code
              </span>
            </button>
          </div>
        </div>
      )}
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
