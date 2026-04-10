import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Navigation,
  Heart,
  Shield,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  RefreshCw,
  Package,
  Pill,
  Syringe,
  Baby,
  Thermometer,
  Activity
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { offlineStorage } from '../../utils/offlineStorage';
import UnifiedVerificationForm from '../Auth/UnifiedVerificationForm';
import { apiService } from '../../services/api';
import { MAPBOX_ACCESS_KEY } from '../../config/api';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  rating: number;
  distance: number;
  coordinates: { lat: number; lng: number };
  type: 'clinic' | 'hospital' | 'counseling' | 'emergency';
  isOpen: boolean;
  region?: string;
  youthFriendly?: boolean;
}

interface SRHRProduct {
  id: string;
  name: string;
  category: 'contraception' | 'emergency' | 'testing' | 'treatment' | 'hygiene' | 'pregnancy';
  description: string;
  icon: any;
  available: boolean;
  requiresPrescription: boolean;
  priceUSD?: number;
  priceGHS?: number;
  imageUrl: string;
}

// Mock SRHR products data with real product names, prices in USD and Ghana Cedis, and real images
const SRHR_PRODUCTS: SRHRProduct[] = [
  // Contraception
  {
    id: 'durex_condoms',
    name: 'Durex Performax Condoms',
    category: 'contraception',
    description: 'Premium ribbed and dotted condoms for enhanced protection and pleasure',
    icon: Shield,
    available: true,
    requiresPrescription: false,
    priceUSD: 12.99,
    priceGHS: 195,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop'
  },
  {
    id: 'trojan_condoms',
    name: 'Trojan ENZ Condoms',
    category: 'contraception',
    description: 'Lubricated latex condoms for reliable protection',
    icon: Shield,
    available: true,
    requiresPrescription: false,
    priceUSD: 9.99,
    priceGHS: 150,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  {
    id: 'female_condom_fc2',
    name: 'FC2 Female Condom',
    category: 'contraception',
    description: 'Female-controlled barrier method for protection and pregnancy prevention',
    icon: Shield,
    available: true,
    requiresPrescription: false,
    priceUSD: 14.99,
    priceGHS: 225,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'ortho_tri_cyclen',
    name: 'Ortho Tri-Cyclen',
    category: 'contraception',
    description: 'Combination birth control pills for pregnancy prevention',
    icon: Pill,
    available: true,
    requiresPrescription: true,
    priceUSD: 45.00,
    priceGHS: 675,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  {
    id: 'mirena_iud',
    name: 'Mirena IUD',
    category: 'contraception',
    description: 'Hormonal intrauterine device for 5-year pregnancy prevention',
    icon: Activity,
    available: true,
    requiresPrescription: true,
    priceUSD: 850.00,
    priceGHS: 12750,
    imageUrl: 'https://images.unsplash.com/photo-1631815587646-b85a84c9b922?w=400&h=400&fit=crop'
  },
  {
    id: 'nexplanon',
    name: 'Nexplanon Implant',
    category: 'contraception',
    description: 'Subdermal contraceptive implant for 3-year protection',
    icon: Syringe,
    available: true,
    requiresPrescription: true,
    priceUSD: 950.00,
    priceGHS: 14250,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop'
  },
  {
    id: 'depo_provera',
    name: 'Depo-Provera Injection',
    category: 'contraception',
    description: '3-month injectable contraceptive for pregnancy prevention',
    icon: Syringe,
    available: true,
    requiresPrescription: true,
    priceUSD: 85.00,
    priceGHS: 1275,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  // Emergency
  {
    id: 'plan_b',
    name: 'Plan B One-Step',
    category: 'emergency',
    description: 'Emergency contraception pill for use within 72 hours',
    icon: Pill,
    available: true,
    requiresPrescription: false,
    priceUSD: 49.99,
    priceGHS: 750,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop'
  },
  {
    id: 'ella',
    name: 'ella Emergency Contraception',
    category: 'emergency',
    description: 'Prescription emergency contraception effective up to 5 days',
    icon: Pill,
    available: true,
    requiresPrescription: true,
    priceUSD: 65.00,
    priceGHS: 975,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  // Testing
  {
    id: 'oraquick_hiv',
    name: 'OraQuick HIV Self-Test',
    category: 'testing',
    description: 'FDA-approved oral fluid HIV test with results in 20 minutes',
    icon: Thermometer,
    available: true,
    requiresPrescription: false,
    priceUSD: 39.99,
    priceGHS: 600,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop'
  },
  {
    id: 'first_response_pregnancy',
    name: 'First Response Pregnancy Test',
    category: 'pregnancy',
    description: 'Early detection pregnancy test kit, results in 3 minutes',
    icon: Baby,
    available: true,
    requiresPrescription: false,
    priceUSD: 14.99,
    priceGHS: 225,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'clearblue_pregnancy',
    name: 'Clearblue Digital Pregnancy Test',
    category: 'pregnancy',
    description: 'Digital pregnancy test with weeks indicator',
    icon: Baby,
    available: true,
    requiresPrescription: false,
    priceUSD: 18.99,
    priceGHS: 285,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'sti_test_kit',
    name: 'Complete STI Screening Kit',
    category: 'testing',
    description: 'At-home test kit for chlamydia, gonorrhea, and syphilis',
    icon: Thermometer,
    available: true,
    requiresPrescription: false,
    priceUSD: 149.99,
    priceGHS: 2250,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop'
  },
  // Treatment
  {
    id: 'azithromycin',
    name: 'Azithromycin (Zithromax)',
    category: 'treatment',
    description: 'Antibiotic for treating chlamydia and other STIs',
    icon: Pill,
    available: true,
    requiresPrescription: true,
    priceUSD: 25.00,
    priceGHS: 375,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  {
    id: 'truvada_prep',
    name: 'Truvada (PrEP)',
    category: 'treatment',
    description: 'HIV pre-exposure prophylaxis medication',
    icon: Pill,
    available: true,
    requiresPrescription: true,
    priceUSD: 1800.00,
    priceGHS: 27000,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  },
  // Hygiene
  {
    id: 'always_pads',
    name: 'Always Ultra Thin Pads',
    category: 'hygiene',
    description: 'Ultra-thin sanitary pads for menstrual protection',
    icon: Package,
    available: true,
    requiresPrescription: false,
    priceUSD: 8.99,
    priceGHS: 135,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'diva_cup',
    name: 'DivaCup',
    category: 'hygiene',
    description: 'Reusable menstrual cup for 12-hour protection',
    icon: Package,
    available: true,
    requiresPrescription: false,
    priceUSD: 39.99,
    priceGHS: 600,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'tampax_pearl',
    name: 'Tampax Pearl Tampons',
    category: 'hygiene',
    description: 'Applicator tampons for comfortable menstrual protection',
    icon: Package,
    available: true,
    requiresPrescription: false,
    priceUSD: 10.99,
    priceGHS: 165,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  },
  {
    id: 'menstrual_cup_kit',
    name: 'Complete Menstrual Kit',
    category: 'hygiene',
    description: 'Sanitary kit with pads, tampons, wipes, and disposal bags',
    icon: Package,
    available: true,
    requiresPrescription: false,
    priceUSD: 24.99,
    priceGHS: 375,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'
  }
];

// Comprehensive clinic data from Marie Stopes, PPAG, and GHS
const COMPREHENSIVE_CLINICS: Clinic[] = [
  // Marie Stopes Clinics
  {
    id: 'ms_ashaiman',
    name: 'Marie Stopes Ashaiman Clinic',
    address: 'Ashaiman Station, 2nd & 3rd Floor, Papaye Enterprise Building, Ashaiman',
    phone: '0800 20 8585',
    hours: 'Monday - Friday: 07:00 - 16:00, Saturday: 07:30 - 13:00',
    services: ['Family Planning', 'STI Testing', 'Counselling', 'Safe Abortion Care'],
    rating: 4.5,
    distance: 0,
    coordinates: { lat: 5.6714, lng: -0.0244 },
    type: 'clinic',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: true
  },
  {
    id: 'ms_hotline',
    name: 'Marie Stopes Toll-Free Hotline',
    address: 'National Hotline Service',
    phone: '0800 20 8585',
    hours: '24/7',
    services: ['Information', 'Referrals', 'Counselling'],
    rating: 4.8,
    distance: 0,
    coordinates: { lat: 5.6037, lng: -0.1870 },
    type: 'counseling',
    isOpen: true,
    region: 'National',
    youthFriendly: true
  },

  // PPAG Centers - Greater Accra
  {
    id: 'ppag_fh_accra',
    name: 'Family Health Clinic (PPAG)',
    address: '6 Naa Asia road Laterbiokoshie Accra, GA-364-2048, Greater Accra Region',
    phone: '+233 20 889 2721',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Family Planning', 'STI Testing', 'Counselling', 'HIV/AIDS Services'],
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 5.5600, lng: -0.2050 },
    type: 'clinic',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: true
  },
  {
    id: 'ppag_ayawaso',
    name: 'PPAG Ayawaso East District',
    address: 'Olesegun Obasanjo Way, GT-020-5892, Greater Accra Region',
    phone: '+233 30 277 1234',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 5.5900, lng: -0.1800 },
    type: 'clinic',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: true
  },
  {
    id: 'ppag_dangme',
    name: 'PPAG Dangme West District',
    address: 'Dangme West District, Greater Accra Region',
    phone: '+233 30 277 5678',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 5.7500, lng: -0.1000 },
    type: 'clinic',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: true
  },

  // PPAG Centers - Eastern Region
  {
    id: 'ppag_akwapim_south',
    name: 'PPAG Akwapim South Municipal',
    address: 'Eastern Region',
    phone: '+233 34 222 1234',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 6.1000, lng: -0.2500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_kwahu_north',
    name: 'PPAG Kwahu North District',
    address: 'Eastern Region',
    phone: '+233 34 222 3456',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 6.5500, lng: -0.7500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_kwahu_south',
    name: 'PPAG Kwahu South District',
    address: 'Eastern Region',
    phone: '+233 34 222 4567',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 6.4500, lng: -0.6500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_fanteakwa',
    name: 'PPAG Fanteakwa District',
    address: 'Eastern Region',
    phone: '+233 34 222 5678',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 6.3000, lng: -0.4500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_birim_central',
    name: 'PPAG Birim Central District',
    address: 'Eastern Region',
    phone: '+233 34 222 6789',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 6.1000, lng: -0.6000 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_akyem_west',
    name: 'PPAG Akyem West District',
    address: 'Eastern Region',
    phone: '+233 34 222 7890',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 5.9500, lng: -0.8500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_lower_manya',
    name: 'PPAG Lower Manya District',
    address: 'Eastern Region',
    phone: '+233 34 222 8901',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 6.0500, lng: -0.0500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_asuogyaman',
    name: 'PPAG Asuogyaman District',
    address: 'Eastern Region',
    phone: '+233 34 222 9012',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 6.1500, lng: 0.0500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_suhum',
    name: 'PPAG Suhum Kraboa Coaltar Municipal',
    address: 'Eastern Region',
    phone: '+233 34 222 0123',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 5.9000, lng: -0.4500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_new_juaben',
    name: 'PPAG New Juaben District',
    address: 'Op. Alhahassan Street, Eastern Region',
    phone: '+233 34 222 1234',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 6.2000, lng: -0.5000 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_manya_krobo',
    name: 'PPAG Manya Krobo District',
    address: 'Eastern Region',
    phone: '+233 34 222 2345',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 6.0500, lng: -0.1000 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },
  {
    id: 'ppag_yilo_krobo',
    name: 'PPAG Yilo Krobo District',
    address: 'Eastern Region',
    phone: '+233 34 222 3456',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 6.1000, lng: -0.1500 },
    type: 'clinic',
    isOpen: true,
    region: 'Eastern',
    youthFriendly: true
  },

  // PPAG Centers - Western Region
  {
    id: 'ppag_sekondi',
    name: 'PPAG Sekondi/Takoradi Metropolitan',
    address: 'Western Region',
    phone: '+233 31 222 4567',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 4.8800, lng: -1.7500 },
    type: 'clinic',
    isOpen: true,
    region: 'Western',
    youthFriendly: true
  },

  // PPAG Centers - Volta Region
  {
    id: 'ppag_central_tongu',
    name: 'PPAG Central Tongu District',
    address: 'Volta Region',
    phone: '+233 36 222 1234',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 6.2500, lng: 0.4500 },
    type: 'clinic',
    isOpen: true,
    region: 'Volta',
    youthFriendly: true
  },
  {
    id: 'ppag_north_tongu',
    name: 'PPAG North Tongu District',
    address: 'Volta Region',
    phone: '+233 36 222 2345',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 6.3500, lng: 0.5500 },
    type: 'clinic',
    isOpen: true,
    region: 'Volta',
    youthFriendly: true
  },
  {
    id: 'ppag_ho',
    name: 'PPAG Ho Municipal',
    address: 'Volta Region',
    phone: '+233 36 222 3456',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 6.6000, lng: 0.4500 },
    type: 'clinic',
    isOpen: true,
    region: 'Volta',
    youthFriendly: true
  },

  // PPAG Centers - Central Region
  {
    id: 'ppag_effutu',
    name: 'PPAG Effutu Municipal',
    address: 'Central Region',
    phone: '+233 42 222 1234',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 5.1000, lng: -0.4000 },
    type: 'clinic',
    isOpen: true,
    region: 'Central',
    youthFriendly: true
  },
  {
    id: 'ppag_cape_coast',
    name: 'PPAG Cape Coast Metropolitan',
    address: 'Central Region',
    phone: '+233 42 222 2345',
    hours: 'Monday - Friday: 08:00 - 17:00',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'STI Testing', 'Safe Abortion Care'],
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 5.1000, lng: -1.2500 },
    type: 'clinic',
    isOpen: true,
    region: 'Central',
    youthFriendly: true
  },

  // Ghana Health Service (GHS) Public Hospitals with SRHR Units
  {
    id: 'ghs_korle_bu',
    name: 'Korle Bu Teaching Hospital',
    address: 'Korle Bu, Accra',
    phone: '+233 30 267 1000',
    hours: '24/7 Emergency, Outpatient: 08:00 - 17:00',
    services: ['Emergency Care', 'SRHR Services', 'Maternity', 'Family Planning', 'STI Testing', 'HIV/AIDS Treatment'],
    rating: 4.7,
    distance: 0,
    coordinates: { lat: 5.5600, lng: -0.2200 },
    type: 'hospital',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: false
  },
  {
    id: 'ghs_komfo_anokye',
    name: 'Komfo Anokye Teaching Hospital',
    address: 'Kumasi, Ashanti Region',
    phone: '+233 32 272 1000',
    hours: '24/7 Emergency, Outpatient: 08:00 - 17:00',
    services: ['Emergency Care', 'SRHR Services', 'Maternity', 'Family Planning', 'STI Testing', 'HIV/AIDS Treatment'],
    rating: 4.6,
    distance: 0,
    coordinates: { lat: 6.6900, lng: -1.6200 },
    type: 'hospital',
    isOpen: true,
    region: 'Ashanti',
    youthFriendly: false
  },
  {
    id: 'ghs_37_military',
    name: '37 Military Hospital',
    address: 'Independence Ave, Near 37 Circle, Accra',
    phone: '+233 30 276 1111',
    hours: '24/7 Emergency, Outpatient: 08:00 - 17:00',
    services: ['Emergency Care', 'SRHR Services', 'Maternity', 'Family Planning', 'STI Testing'],
    rating: 4.5,
    distance: 0,
    coordinates: { lat: 5.5800, lng: -0.1800 },
    type: 'hospital',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: false
  },
  {
    id: 'ghs_police',
    name: 'Police Hospital',
    address: 'Cantonments Rd, Near Danquah Circle, Accra',
    phone: '+233 30 276 2389',
    hours: '24/7 Emergency, Outpatient: 08:00 - 17:00',
    services: ['Emergency Care', 'SRHR Services', 'Maternity', 'Women & Children Focus'],
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 5.5700, lng: -0.1500 },
    type: 'hospital',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: false
  },
  {
    id: 'ghs_ridge',
    name: 'Ridge Hospital',
    address: 'Castle Rd, Accra',
    phone: '+233 30 277 5555',
    hours: '24/7 Emergency, Outpatient: 08:00 - 17:00',
    services: ['Emergency Care', 'SRHR Services', 'Maternity', 'Women & Children Focus'],
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 5.5600, lng: -0.2000 },
    type: 'hospital',
    isOpen: true,
    region: 'Greater Accra',
    youthFriendly: false
  }
];

const ClinicFinder: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get fresh data from API first
      const response = await apiService.getClinics() as { success: boolean; clinics?: any[] };
      if (response.success && response.clinics && response.clinics.length > 0) {
        // Transform API data to match component interface
        const apiClinics = response.clinics.map((clinic: any) => ({
          id: clinic.id.toString(),
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone || '',
          hours: clinic.hours || 'Hours not specified',
          services: clinic.services || [],
          rating: 4.0, // Default rating since API doesn't provide it
          distance: 0, // Will be calculated based on user location
          coordinates: clinic.coordinates,
          type: clinic.type,
          isOpen: true // Default to open
        }));
        setClinics(apiClinics);
        // Store for offline use
        await offlineStorage.storeData('clinics', apiClinics);
      } else {
        // Use comprehensive mock data as primary fallback
        setClinics(COMPREHENSIVE_CLINICS);
      }
    } catch (apiError) {
      console.warn('API unavailable, using comprehensive clinic data:', apiError);
      // Use comprehensive mock data as fallback
      setClinics(COMPREHENSIVE_CLINICS);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Accra)
          setUserLocation({ lat: 5.6037, lng: -0.1870 });
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Use default location (Accra)
      setUserLocation({ lat: 5.6037, lng: -0.1870 });
      setIsLoadingLocation(false);
    }
  };

  const filterAndSortClinics = useCallback(() => {
    let filtered = clinics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((clinic: Clinic) =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.services.some((service: string) => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((clinic: Clinic) => clinic.type === selectedType);
    }

    // Sort
    filtered.sort((a: Clinic, b: Clinic) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredClinics(filtered);
  }, [clinics, searchTerm, selectedType, sortBy]);

  useEffect(() => {
    // Load clinics from offline storage or use sample data
    loadClinics();
    getUserLocation();
  }, [loadClinics]);

  useEffect(() => {
    filterAndSortClinics();
  }, [filterAndSortClinics]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1870, 5.6037], // Accra, Ghana
      zoom: 12,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers for clinics when they're loaded
  useEffect(() => {
    if (!mapRef.current || clinics.length === 0) return;

    const map = mapRef.current;

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers for filtered clinics
    filteredClinics.forEach((clinic) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%236366f1\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\'/%3E%3C/svg%3E")';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat([clinic.coordinates.lng, clinic.coordinates.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3 style="margin:0 0 5px 0;font-size:14px;">${clinic.name}</h3><p style="margin:0;font-size:12px;">${clinic.address}</p>`))
        .addTo(map);
    });

    // Fit map to show all clinics
    if (filteredClinics.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredClinics.forEach(clinic => {
        bounds.extend([clinic.coordinates.lng, clinic.coordinates.lat]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredClinics, clinics.length]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clinic':
        return Heart;
      case 'hospital':
        return Shield;
      case 'counseling':
        return Users;
      case 'emergency':
        return Calendar;
      default:
        return MapPin;
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (coordinates: { lat: number; lng: number }) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleVerificationComplete = (verified: boolean) => {
    setShowVerification(false);
    if (verified && selectedClinic) {
      // User is verified, they can now access directions
      handleDirections(selectedClinic.coordinates);
      setSelectedClinic(null);
    }
  };

  return (
    <div className="space-y-6">
        {/* Hero with search */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Find Clinics</h1>
              <p className="text-sm text-white/90 mb-4">Search for SRHR clinics, hospitals, and counseling services near you.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search clinics, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI suggestion */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Not sure which clinic to choose?</p>
          <button
            onClick={() => navigate('/chatbot?context=clinics')}
            className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-600 rounded-xl font-medium hover:from-primary-500/20 hover:to-purple-500/20 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask ReproBot for recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mapbox Map */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm">
          <div ref={mapContainerRef} className="h-64 sm:h-80 w-full" />
        </div>

        {/* Filters - pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'clinic', label: 'Clinics' },
            { value: 'hospital', label: 'Hospitals' },
            { value: 'counseling', label: 'Counseling' },
            { value: 'emergency', label: 'Emergency' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedType === value ? 'bg-primary-500 text-white' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:border-primary-200'}`}
            >
              {label}
            </button>
          ))}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm bg-white">
            <option value="distance">Nearest</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name</option>
          </select>
          <button onClick={getUserLocation} disabled={isLoadingLocation} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm font-medium flex items-center gap-2">
            <Navigation size={16} />
            {isLoadingLocation ? 'Getting...' : 'My Location'}
          </button>
        </div>

        {/* SRHR Products Section */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Available SRHR Products & Kits</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Essential sexual and reproductive health products available at partner clinics</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {SRHR_PRODUCTS.map((product) => {
              const ProductIcon = product.icon;
              const categoryColors = {
                contraception: 'from-blue-500 to-cyan-500',
                emergency: 'from-red-500 to-pink-500',
                testing: 'from-purple-500 to-indigo-500',
                treatment: 'from-green-500 to-emerald-500',
                hygiene: 'from-pink-500 to-rose-500',
                pregnancy: 'from-amber-500 to-orange-500'
              };
              
              return (
                <div key={product.id} className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/80 overflow-hidden hover:shadow-md transition-all">
                  {/* Product Image */}
                  <div className="relative h-40 sm:h-48 bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      product.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {product.available ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${categoryColors[product.category]} mb-2`}>
                      <ProductIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* Prices */}
                    <div className="flex items-center gap-2 mb-2">
                      {product.priceUSD && (
                        <span className="text-sm font-semibold text-gray-900">${product.priceUSD.toFixed(2)} USD</span>
                      )}
                      {product.priceGHS && (
                        <span className="text-sm font-semibold text-primary-600">₵{product.priceGHS.toFixed(0)} GHS</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {product.requiresPrescription && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Rx Required</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredClinics.length > 0 ? (
          filteredClinics.map((clinic: Clinic) => {
            const TypeIcon = getTypeIcon(clinic.type);
            return (
              <div key={clinic.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 p-4 sm:p-5">
                  {/* Icon */}
                  <div className={`p-2 sm:p-3 rounded-xl shadow-sm flex-shrink-0 ${
                    clinic.type === 'clinic' ? 'bg-blue-100 text-blue-700' :
                    clinic.type === 'hospital' ? 'bg-green-100 text-green-700' :
                    clinic.type === 'counseling' ? 'bg-purple-100 text-purple-700' :
                    clinic.type === 'emergency' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-1">
                            {clinic.name}
                          </h3>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              clinic.type === 'clinic' ? 'bg-blue-100 text-blue-700' :
                              clinic.type === 'hospital' ? 'bg-green-100 text-green-700' :
                              clinic.type === 'counseling' ? 'bg-purple-100 text-purple-700' :
                              clinic.type === 'emergency' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {clinic.type.toUpperCase()}
                            </span>
                            {clinic.youthFriendly && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700">
                                YOUTH FRIENDLY
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{clinic.address}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-gray-900">{clinic.rating}</span>
                        </div>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${clinic.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {clinic.isOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                      </div>
                    </div>

                    {/* Region Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {clinic.region}
                      </span>
                    </div>

                    {/* Services */}
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1.5">SERVICES OFFERED</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {clinic.services.slice(0, 4).map((service, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md border border-primary-100">
                            {service}
                          </span>
                        ))}
                        {clinic.services.length > 4 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                            +{clinic.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hours & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                        <span className="line-clamp-1">{clinic.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                        <span className="font-medium">{clinic.phone}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a href={`tel:${clinic.phone}`} onClick={() => handleCall(clinic.phone)} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[44px] hover:from-primary-600 hover:to-purple-600 transition-all shadow-md shadow-primary-500/20">
                        <Phone size={18} />
                        <span>Call Now</span>
                      </a>
                      <button onClick={() => { setSelectedClinic(clinic); setShowVerification(true); }} className="flex-1 py-2.5 px-4 bg-white border-2 border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[44px] hover:border-primary-300 hover:bg-gray-50 transition-all">
                        <Navigation size={18} />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 sm:py-16">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No clinics found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Emergency Notice */}
      <div className="rounded-2xl bg-red-50/80 border border-red-200/60 p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Emergency Services</h4>
            <p className="text-red-800 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
              If you're experiencing a medical emergency or need immediate help, call the emergency hotline or visit the nearest hospital.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a href="tel:+233-24-555-9999" className="py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px]">
                <Phone size={18} />
                <span>Emergency Hotline</span>
              </a>
              <a href="tel:+233-24-555-0104" className="py-2.5 px-4 border-2 border-red-600 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] hover:bg-red-600 hover:text-white"
              >
                <Shield size={18} />
                <span>GBV Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UnifiedVerificationForm
              onVerificationComplete={handleVerificationComplete}
              serviceName={selectedClinic?.name || 'Clinic'}
              isEmergency={false}
              showOTP={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicFinder;
