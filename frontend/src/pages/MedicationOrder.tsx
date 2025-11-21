import React, { useState } from 'react';
import { 
  Pill, 
  CheckCircle, 
  Search,
} from 'lucide-react';

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
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface OrderItem {
  medication: Medication;
  quantity: number;
  price: number;
}

const MedicationOrder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Sample medications database
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
      image: '/api/placeholder/100/100',
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
      image: '/api/placeholder/100/100',
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
      image: '/api/placeholder/100/100',
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
      image: '/api/placeholder/100/100',
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
      image: '/api/placeholder/100/100',
      rating: 4.2,
      reviews: 312
    }
  ];

  // Sample pharmacies
  const pharmacies: Pharmacy[] = [
    {
      id: 'pharm_1',
      name: 'SafeHealth Pharmacy',
      address: '123 Main Street, Monrovia',
      phone: '+231-555-0123',
      distance: 0.8,
      rating: 4.6,
      deliveryAvailable: true,
      deliveryFee: 5.00,
      deliveryTime: '30-45 min',
      isOpen: true,
      coordinates: { lat: 6.3008, lng: -10.7970 }
    },
    {
      id: 'pharm_2',
      name: 'Liberty Medical Center',
      address: '456 Broad Street, Monrovia',
      phone: '+231-555-0456',
      distance: 1.2,
      rating: 4.4,
      deliveryAvailable: true,
      deliveryFee: 7.00,
      deliveryTime: '45-60 min',
      isOpen: true,
      coordinates: { lat: 6.3108, lng: -10.8070 }
    },
    {
      id: 'pharm_3',
      name: 'Youth Health Pharmacy',
      address: '789 Tubman Boulevard, Monrovia',
      phone: '+231-555-0789',
      distance: 2.1,
      rating: 4.8,
      deliveryAvailable: false,
      deliveryFee: 0,
      deliveryTime: 'N/A',
      isOpen: false,
      coordinates: { lat: 6.3208, lng: -10.8170 }
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Contraception', label: 'Contraception' },
    { value: 'Emergency Contraception', label: 'Emergency Contraception' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Pain Relief', label: 'Pain Relief' },
    { value: 'STI Treatment', label: 'STI Treatment' },
    { value: 'Prenatal Care', label: 'Prenatal Care' }
  ];

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medication.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medication: Medication) => {
    const existingItem = cart.find(item => item.medication.id === medication.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.medication.id === medication.id 
          ? { ...item, quantity: item.quantity + 1, price: (item.quantity + 1) * medication.price }
          : item
      ));
    } else {
      setCart([...cart, { medication, quantity: 1, price: medication.price }]);
    }
  };

  const removeFromCart = (medicationId: string) => {
    setCart(cart.filter(item => item.medication.id !== medicationId));
  };

  const updateQuantity = (medicationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicationId);
    } else {
      setCart(cart.map(item => 
        item.medication.id === medicationId 
          ? { ...item, quantity, price: quantity * item.medication.price }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getDeliveryFee = () => {
    return selectedPharmacy?.deliveryFee || 0;
  };

  const getTotalWithDelivery = () => {
    return getTotalPrice() + getDeliveryFee();
  };

  const handleOrder = async () => {
    setIsOrdering(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOrderPlaced(true);
    setIsOrdering(false);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'text-green-600 bg-green-100';
      case 'low-stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your medication order has been placed and will be processed shortly.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Order Details</h3>
              <p className="text-sm text-blue-700">
                Order ID: #ORD-{Date.now().toString().slice(-6)}
              </p>
              <p className="text-sm text-blue-700">
                Estimated Delivery: {selectedPharmacy?.deliveryTime || 'N/A'}
              </p>
            </div>
            <button
              onClick={() => {
                setOrderPlaced(false);
                setCart([]);
                setSelectedPharmacy(null);
              }}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Medications</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Order prescription and over-the-counter medications with secure delivery
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card mb-4 sm:mb-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Medications List */}
            <div className="lg:col-span-2">
              <div className="space-y-3 sm:space-y-4">
                {filteredMedications.map(medication => (
                  <div key={medication.id} className="card group hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Medication Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="w-8 h-8 text-gray-400" />
                      </div>

                      {/* Medication Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                              {medication.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {medication.genericName} • {medication.dosage} • {medication.form}
                            </p>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(medication.availability)}`}>
                                {getAvailabilityText(medication.availability)}
                              </span>
                              {medication.requiresPrescription && (
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                                  Prescription Required
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${medication.price}</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {medication.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {medication.requiresPrescription && (
                              <button
                                onClick={() => {/* Handle prescription upload */}}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                Upload Prescription
                              </button>
                            )}
                            <button
                              onClick={() => addToCart(medication)}
                              disabled={medication.availability === 'out-of-stock'}
                              className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart and Pharmacy Selection */}
            <div className="space-y-4 sm:space-y-6">
              {/* Pharmacy Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Pharmacy</h3>
                <div className="space-y-3">
                  {pharmacies.map(pharmacy => (
                    <div
                      key={pharmacy.id}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPharmacy?.id === pharmacy.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{pharmacy.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{pharmacy.address}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{pharmacy.distance} km away</span>
                            <span>•</span>
                            <span className={pharmacy.isOpen ? 'text-green-600' : 'text-red-600'}>
                              {pharmacy.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        {pharmacy.deliveryAvailable && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">${pharmacy.deliveryFee} delivery</p>
                            <p className="text-xs text-gray-500">{pharmacy.deliveryTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Cart</h3>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.medication.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.medication.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.medication.price} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.medication.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.medication.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    {selectedPharmacy && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-semibold">${getDeliveryFee().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${getTotalWithDelivery().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOrder}
                    disabled={!selectedPharmacy || isOrdering}
                    className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isOrdering ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicationOrder;
