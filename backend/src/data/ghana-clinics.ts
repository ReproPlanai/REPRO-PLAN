export interface GhanaClinic {
  id: string;
  name: string;
  organization: string;
  address: string;
  phone: string;
  region: string;
  district?: string;
  services: string[];
  youthFriendly: boolean;
  operatingHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'hospital' | 'clinic' | 'health-center' | 'specialized';
}

export const GHANA_CLINICS: GhanaClinic[] = [
  // Marie Stopes Clinics
  {
    id: 'ms-ashaiman',
    name: 'Marie Stopes Ashaiman Clinic',
    organization: 'Marie Stopes',
    address: 'Ashaiman Station, 2nd & 3rd Floor, Papaye Enterprise Building, Ashaiman',
    phone: '0800 20 8585',
    region: 'Greater Accra',
    district: 'Ashaiman',
    services: ['Family Planning', 'STI Testing', 'Counselling', 'Safe Abortion Care', 'Prenatal Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 07:00 - 16:00, Saturday: 07:30 - 13:00, Sunday: Closed',
    coordinates: { lat: 5.6175, lng: -0.0267 },
    type: 'clinic'
  },
  {
    id: 'ms-tollfree',
    name: 'Marie Stopes Ghana Hotline',
    organization: 'Marie Stopes',
    address: 'National Hotline Service',
    phone: '0800 20 8585',
    region: 'National',
    services: ['Counselling', 'Referrals', 'Information'],
    youthFriendly: true,
    operatingHours: '24/7',
    coordinates: { lat: 5.6037, lng: -0.1870 },
    type: 'specialized'
  },

  // PPAG Centers
  {
    id: 'ppag-fhc',
    name: 'Family Health Clinic (PPAG)',
    organization: 'PPAG',
    address: '6 Naa Asia road Laterbiokoshie Accra, GA-364-2048',
    phone: '+233 20 889 2721',
    region: 'Greater Accra',
    services: ['Family Planning'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.5650, lng: -0.2333 },
    type: 'clinic'
  },
  {
    id: 'ppag-ayawaso',
    name: 'PPAG Ayawaso East District',
    organization: 'PPAG',
    address: 'Olesegun Obasanjo Way, GT-020-5892',
    phone: '+233 20 889 2721',
    region: 'Greater Accra',
    district: 'Ayawaso East',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.6300, lng: -0.1800 },
    type: 'clinic'
  },
  {
    id: 'ppag-akwapim-south',
    name: 'PPAG Akwapim South Municipal',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Akwapim South',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.1333, lng: -0.2500 },
    type: 'clinic'
  },
  {
    id: 'ppag-kwahu-north',
    name: 'PPAG Kwahu North District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Kwahu North',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.9333, lng: -0.9167 },
    type: 'clinic'
  },
  {
    id: 'ppag-kwahu-south',
    name: 'PPAG Kwahu South District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Kwahu South',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.5500, lng: -0.7833 },
    type: 'clinic'
  },
  {
    id: 'ppag-fanteakwa',
    name: 'PPAG Fanteakwa District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Fanteakwa',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.4333, lng: -0.4333 },
    type: 'clinic'
  },
  {
    id: 'ppag-birim-central',
    name: 'PPAG Birim Central District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Birim Central',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.3833, lng: -0.6167 },
    type: 'clinic'
  },
  {
    id: 'ppag-akyem-west',
    name: 'PPAG Akyem West District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Akyem West',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.0333, lng: -0.9333 },
    type: 'clinic'
  },
  {
    id: 'ppag-lower-manya',
    name: 'PPAG Lower Manya District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Lower Manya',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.0833, lng: -0.0333 },
    type: 'clinic'
  },
  {
    id: 'ppag-asuogyaman',
    name: 'PPAG Asuogyaman District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Asuogyaman',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.5500, lng: -0.0167 },
    type: 'clinic'
  },
  {
    id: 'ppag-suhum',
    name: 'PPAG Suhum Kraboa Coaltar Municipal',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Suhum',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.8500, lng: -0.3833 },
    type: 'clinic'
  },
  {
    id: 'ppag-new-juaben',
    name: 'PPAG New Juaben District',
    organization: 'PPAG',
    address: 'Op. Alhahassan Street',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'New Juaben',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.4500, lng: -0.5167 },
    type: 'clinic'
  },
  {
    id: 'ppag-manya-krobo',
    name: 'PPAG Manya Krobo District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Manya Krobo',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.0833, lng: -0.0333 },
    type: 'clinic'
  },
  {
    id: 'ppag-yilo-krobo',
    name: 'PPAG Yilo Krobo District',
    organization: 'PPAG',
    address: 'Eastern Region',
    phone: '+233 20 889 2721',
    region: 'Eastern',
    district: 'Yilo Krobo',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.1000, lng: -0.0500 },
    type: 'clinic'
  },
  {
    id: 'ppag-sekondi',
    name: 'PPAG Sekondi/Takoradi Metropolitan',
    organization: 'PPAG',
    address: 'Western Region',
    phone: '+233 20 889 2721',
    region: 'Western',
    district: 'Sekondi/Takoradi',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 4.8833, lng: -1.7833 },
    type: 'clinic'
  },
  {
    id: 'ppag-central-tongu',
    name: 'PPAG Central Tongu District',
    organization: 'PPAG',
    address: 'Volta Region',
    phone: '+233 20 889 2721',
    region: 'Volta',
    district: 'Central Tongu',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.0833, lng: 0.4167 },
    type: 'clinic'
  },
  {
    id: 'ppag-north-tongu',
    name: 'PPAG North Tongu District',
    organization: 'PPAG',
    address: 'Volta Region',
    phone: '+233 20 889 2721',
    region: 'Volta',
    district: 'North Tongu',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.2500, lng: 0.4500 },
    type: 'clinic'
  },
  {
    id: 'ppag-ho',
    name: 'PPAG Ho Municipal',
    organization: 'PPAG',
    address: 'Volta Region',
    phone: '+233 20 889 2721',
    region: 'Volta',
    district: 'Ho',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 6.6000, lng: 0.4667 },
    type: 'clinic'
  },
  {
    id: 'ppag-effutu',
    name: 'PPAG Effutu Municipal',
    organization: 'PPAG',
    address: 'Central Region',
    phone: '+233 20 889 2721',
    region: 'Central',
    district: 'Effutu',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.1000, lng: -0.6000 },
    type: 'clinic'
  },
  {
    id: 'ppag-cape-coast',
    name: 'PPAG Cape Coast Metropolitan',
    organization: 'PPAG',
    address: 'Central Region',
    phone: '+233 20 889 2721',
    region: 'Central',
    district: 'Cape Coast',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.1000, lng: -1.2500 },
    type: 'clinic'
  },
  {
    id: 'ppag-dangme-west',
    name: 'PPAG Dangme West District',
    organization: 'PPAG',
    address: 'Greater Accra Region',
    phone: '+233 20 889 2721',
    region: 'Greater Accra',
    district: 'Dangme West',
    services: ['Abortion (CAC)', 'Family Planning', 'Gender-based Violence', 'Gynaecology', 'HIV/AIDS', 'Prenatal & Postnatal Care', 'Sexually Transmitted Infection', 'Safe Abortion Care'],
    youthFriendly: true,
    operatingHours: 'Monday - Friday: 08:00 - 17:00',
    coordinates: { lat: 5.7500, lng: 0.1500 },
    type: 'clinic'
  },

  // Ghana Health Service Hospitals
  {
    id: 'ghs-korle-bu',
    name: 'Korle Bu Teaching Hospital',
    organization: 'Ghana Health Service',
    address: 'Korle Bu, Accra',
    phone: '+233 302 677402',
    region: 'Greater Accra',
    services: ['Full SRHR Services', 'Emergency Care', 'Maternity', 'Family Planning', 'STI Testing'],
    youthFriendly: false,
    operatingHours: '24/7',
    coordinates: { lat: 5.5567, lng: -0.2333 },
    type: 'hospital'
  },
  {
    id: 'ghs-komfo-anokye',
    name: 'Komfo Anokye Teaching Hospital',
    organization: 'Ghana Health Service',
    address: 'Kumasi',
    phone: '+233 322 160577',
    region: 'Ashanti',
    services: ['Full SRHR Services', 'Emergency Care', 'Maternity', 'Family Planning', 'STI Testing'],
    youthFriendly: false,
    operatingHours: '24/7',
    coordinates: { lat: 6.6917, lng: -1.6233 },
    type: 'hospital'
  },
  {
    id: 'ghs-37-military',
    name: '37 Military Hospital',
    organization: 'Ghana Health Service',
    address: 'Independence Ave, Near 37 Circle, Accra',
    phone: '+233 302 776111',
    region: 'Greater Accra',
    services: ['Emergency Care', 'Maternity', 'Family Planning', 'STI Testing'],
    youthFriendly: false,
    operatingHours: '24/7',
    coordinates: { lat: 5.5750, lng: -0.1833 },
    type: 'hospital'
  },
  {
    id: 'ghs-police',
    name: 'Police Hospital',
    organization: 'Ghana Health Service',
    address: 'Cantonments Rd, Near Danquah Circle, Accra',
    phone: '+233 302 762389',
    region: 'Greater Accra',
    services: ['Emergency Care', 'Maternity', 'Family Planning', 'STI Testing'],
    youthFriendly: false,
    operatingHours: '24/7',
    coordinates: { lat: 5.5667, lng: -0.1750 },
    type: 'hospital'
  },
  {
    id: 'ghs-ridge',
    name: 'Ridge Hospital',
    organization: 'Ghana Health Service',
    address: 'Castle Rd, Accra',
    phone: '+233 302 221542',
    region: 'Greater Accra',
    services: ['Women & Children Care', 'Maternity', 'Family Planning', 'STI Testing'],
    youthFriendly: false,
    operatingHours: '24/7',
    coordinates: { lat: 5.5500, lng: -0.2167 },
    type: 'hospital'
  }
];

export const GHANA_EMERGENCY_NUMBERS = {
  police: { name: 'Police Emergency', number: '191', altNumber: '+233 244 342 764' },
  ambulance: { name: 'Ambulance Service', number: '193', altNumber: '+233 302 776 527' },
  fire: { name: 'Fire Service', number: '192', altNumber: '+233 302 772 446' },
  domesticViolence: { name: 'Domestic Violence Hotline', number: '0800 800 800', altNumber: '' },
  srhrHotline: { name: 'SRHR Hotline (Marie Stopes)', number: '0800 20 8585', altNumber: '' },
  childHelpline: { name: 'Child Helpline', number: '116', altNumber: '' }
};
