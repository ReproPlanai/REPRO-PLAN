import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Search,
  Filter,
  Sparkles,
  Shield,
  Truck,
  Clock,
  Heart,
  Pill,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import { apiService } from '../services/api';

interface Medicine {
  id: string;
  name: string;
  category: 'contraception' | 'emergency_contraception' | 'menstrual_health' | 'sti_prevention' | 'general_health';
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  prescriptionRequired: boolean;
  tags: string[];
  rating: number;
  reviews: number;
}

const SRHR_MEDICINES: Medicine[] = [
  {
    id: 'condoms_regular',
    name: 'Premium Condoms (12-pack)',
    category: 'contraception',
    description: 'High-quality latex condoms for pregnancy and STI prevention. Lubricated for comfort.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['contraception', 'st prevention', 'no prescription'],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 'condoms_female',
    name: 'Female Condoms (5-pack)',
    category: 'contraception',
    description: 'Female-controlled contraception method. Non-latex, hormone-free protection.',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['contraception', 'female-controlled', 'no prescription'],
    rating: 4.6,
    reviews: 89
  },
  {
    id: 'morning_pill',
    name: 'Emergency Contraception Pill',
    category: 'emergency_contraception',
    description: 'Levonorgestrel emergency contraceptive. Effective up to 72 hours after unprotected sex.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['emergency', 'no prescription', 'time-sensitive'],
    rating: 4.9,
    reviews: 567
  },
  {
    id: 'birth_control_pills',
    name: 'Combined Oral Contraceptives (28-day)',
    category: 'contraception',
    description: 'Daily birth control pills. Consult healthcare provider before use.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: true,
    tags: ['contraception', 'daily', 'prescription required'],
    rating: 4.7,
    reviews: 312
  },
  {
    id: 'menstrual_pads',
    name: 'Organic Menstrual Pads (24-pack)',
    category: 'menstrual_health',
    description: 'Chemical-free, breathable menstrual pads for comfortable period protection.',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1616400619295-8f0e0dd92e38?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['menstrual', 'organic', 'no prescription'],
    rating: 4.8,
    reviews: 445
  },
  {
    id: 'menstrual_cup',
    name: 'Medical-Grade Menstrual Cup',
    category: 'menstrual_health',
    description: 'Reusable, eco-friendly menstrual cup. Lasts up to 12 hours.',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['menstrual', 'reusable', 'eco-friendly'],
    rating: 4.9,
    reviews: 278
  },
  {
    id: 'folic_acid',
    name: 'Folic Acid Supplements (90 tablets)',
    category: 'general_health',
    description: 'Essential for reproductive health. Supports healthy pregnancy planning.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['supplements', 'pregnancy planning', 'no prescription'],
    rating: 4.7,
    reviews: 189
  },
  {
    id: 'prenatal_vitamins',
    name: 'Prenatal Multivitamins (60 tablets)',
    category: 'general_health',
    description: 'Complete prenatal nutrition support. Iron, folic acid, and DHA.',
    price: 42.00,
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55100?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['prenatal', 'vitamins', 'no prescription'],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 'st_test_kit',
    name: 'STI Home Test Kit',
    category: 'sti_prevention',
    description: 'Confidential home testing for common STIs. Results in 7 days.',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['st testing', 'home test', 'confidential'],
    rating: 4.6,
    reviews: 156
  },
  {
    id: 'lubricant',
    name: 'Water-Based Personal Lubricant',
    category: 'contraception',
    description: 'pH-balanced, condom-compatible lubricant. Enhances comfort.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['lubricant', 'condom-safe', 'no prescription'],
    rating: 4.7,
    reviews: 321
  },
  {
    id: 'pain_relief',
    name: 'Menstrual Pain Relief (500mg, 20 tablets)',
    category: 'menstrual_health',
    description: 'Fast-acting pain relief for menstrual cramps and discomfort. Ibuprofen-based formula.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['pain relief', 'menstrual', 'no prescription'],
    rating: 4.5,
    reviews: 678
  },
  {
    id: 'thermometer',
    name: 'Digital Basal Thermometer',
    category: 'general_health',
    description: 'Precision digital thermometer for fertility tracking and basal body temperature monitoring.',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['fertility', 'tracking', 'no prescription'],
    rating: 4.4,
    reviews: 145
  },
  {
    id: 'pantyliners',
    name: 'Organic Pantyliners (40-pack)',
    category: 'menstrual_health',
    description: 'Breathable, chemical-free pantyliners for daily freshness and light protection.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1586495988301-6f6f0e8e9289?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['menstrual', 'daily', 'organic'],
    rating: 4.6,
    reviews: 312
  },
  {
    id: 'hiv_test',
    name: 'HIV Self-Test Kit',
    category: 'sti_prevention',
    description: 'WHO-prequalified HIV self-test kit. Results in 15 minutes. 99.7% accurate.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['hiv testing', 'home test', 'confidential'],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 'pregnancy_test',
    name: 'Early Pregnancy Test Kit (2-pack)',
    category: 'general_health',
    description: 'Ultra-sensitive pregnancy test. Detects pregnancy up to 5 days before missed period.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['pregnancy', 'testing', 'no prescription'],
    rating: 4.7,
    reviews: 567
  },
  {
    id: 'iron_supplement',
    name: 'Iron + Vitamin C Supplements (60 tablets)',
    category: 'general_health',
    description: 'Iron supplements with Vitamin C for better absorption. Supports blood health during pregnancy.',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['supplements', 'iron', 'no prescription'],
    rating: 4.5,
    reviews: 189
  },
  {
    id: 'yeast_infection',
    name: 'Yeast Infection Treatment (1-day)',
    category: 'general_health',
    description: 'Fast-acting antifungal treatment for yeast infections. Single dose applicator.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1628126235206-5660b8bafb4e?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['infection treatment', 'antifungal', 'no prescription'],
    rating: 4.6,
    reviews: 423
  },
  {
    id: 'condoms_extra',
    name: 'Extra-Large Condoms (12-pack)',
    category: 'contraception',
    description: 'Extra-large premium condoms for enhanced comfort and protection. Lubricated.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['contraception', 'st prevention', 'no prescription'],
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'period_tracker',
    name: 'Digital Fertility Tracker',
    category: 'general_health',
    description: 'Smart fertility tracker with app integration. Tracks cycle, ovulation, and predictions.',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['fertility', 'tracking', 'smart device'],
    rating: 4.3,
    reviews: 89
  },
  {
    id: 'calcium_supplement',
    name: 'Calcium + Vitamin D3 (90 tablets)',
    category: 'general_health',
    description: 'Essential bone health support. Calcium and Vitamin D3 for women\'s health.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['supplements', 'bone health', 'no prescription'],
    rating: 4.6,
    reviews: 234
  },
  {
    id: 'urinary_health',
    name: 'Urinary Tract Health Supplement (30 capsules)',
    category: 'general_health',
    description: 'Cranberry extract supplement for urinary tract health support. Prevents UTIs.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    inStock: true,
    prescriptionRequired: false,
    tags: ['supplements', 'urinary health', 'no prescription'],
    rating: 4.4,
    reviews: 178
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: Package },
  { id: 'contraception', label: 'Contraception', icon: Shield },
  { id: 'emergency_contraception', label: 'Emergency', icon: AlertCircle },
  { id: 'menstrual_health', label: 'Menstrual Health', icon: Heart },
  { id: 'sti_prevention', label: 'STI Prevention', icon: Shield },
  { id: 'general_health', label: 'General Health', icon: Pill }
];

const MedicineShop: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Medicine[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    // Set default recommendations directly from mock data
    setAiRecommendations(SRHR_MEDICINES.slice(0, 3));
    setLoadingRecommendations(false);
  }, []);

  const filteredMedicines = SRHR_MEDICINES.filter(medicine => {
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (medicineId: string) => {
    setCart(prev => ({
      ...prev,
      [medicineId]: (prev[medicineId] || 0) + 1
    }));
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[medicineId] > 1) {
        newCart[medicineId]--;
      } else {
        delete newCart[medicineId];
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const medicine = SRHR_MEDICINES.find(m => m.id === id);
    return { medicine, quantity };
  }).filter(item => item.medicine) as { medicine: Medicine; quantity: number }[];

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

  const handleCheckout = () => {
    // In a real app, this would integrate with payment processing
    alert('Checkout functionality would be integrated with Ghana payment gateways (MTN Mobile Money, Vodafone Cash, etc.)');
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Package;
  };

  return (
    <PageContainer gradient gradientFrom="from-slate-50" gradientVia="via-white" gradientTo="to-primary-50/20">
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">SRHR Shop</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Medicine & Health Products</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Order essential SRHR products discreetly. Fast delivery across Ghana with secure payment options.
              </p>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">ReproBot Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {aiRecommendations.map((medicine) => (
                <div key={medicine.id} className="p-3 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-200/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{medicine.name}</h4>
                      <p className="text-xs text-gray-500">GH₵ {medicine.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-6">
          {filteredMedicines.map((medicine) => {
            const cartQuantity = cart[medicine.id] || 0;
            return (
              <div key={medicine.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="w-full h-full object-cover"
                  />
                  {medicine.prescriptionRequired && (
                    <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                      Prescription
                    </div>
                  )}
                  {!medicine.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 mb-1 block">{CATEGORIES.find(c => c.id === medicine.category)?.label}</span>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{medicine.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-gray-900">GH₵{medicine.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-yellow-500">★</span>
                      <span>{medicine.rating}</span>
                      <span>({medicine.reviews})</span>
                    </div>
                  </div>

                  {medicine.inStock ? (
                    cartQuantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(medicine.id)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-900 w-8 text-center">{cartQuantity}</span>
                        <button
                          onClick={() => addToCart(medicine.id)}
                          className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(medicine.id)}
                        className="w-full py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Panel */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:animate-none">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cartItems.length})
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map(({ medicine, quantity }) => (
                      <div key={medicine.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{medicine.name}</h4>
                          <p className="text-xs text-gray-500">GH₵{medicine.price.toFixed(2)} × {quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">GH₵{(medicine.price * quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">GH₵{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>GH₵{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Fast & Discreet Delivery</h4>
              <p className="text-blue-800 text-sm">
                Orders delivered within 2-3 business days across Ghana. Plain packaging for your privacy.
                Payment via MTN Mobile Money, Vodafone Cash, or cash on delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-6 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm">Important Safety Information</h4>
              <ul className="text-amber-800 text-xs mt-1 space-y-1">
                <li>• Consult a healthcare provider before using prescription medications</li>
                <li>• Read all product labels and instructions carefully</li>
                <li>• Emergency contraception is most effective within 72 hours</li>
                <li>• Products are for personal use and should not be shared</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
};

export default MedicineShop;
