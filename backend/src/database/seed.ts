import { sequelize, Clinic } from '../models';

const clinicData = [
  {
    name: 'Monrovia Health Center',
    address: 'Broad Street, Monrovia',
    phone: '+231-555-0101',
    coordinates: { lat: 6.3008, lng: -10.7972 },
    services: ['STI Testing', 'Contraception', 'Prenatal Care', 'Counseling'],
    hours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-1PM',
    type: 'clinic' as const,
    isActive: true
  },
  {
    name: 'Youth Friendly Services Center',
    address: 'Capitol Hill, Monrovia',
    phone: '+231-555-0102',
    coordinates: { lat: 6.3108, lng: -10.8072 },
    services: ['Youth Counseling', 'SRHR Education', 'Peer Support', 'Emergency Contraception'],
    hours: 'Mon-Sat: 9AM-6PM',
    type: 'counseling' as const,
    isActive: true
  },
  {
    name: 'Redemption Hospital',
    address: 'Bushrod Island, Monrovia',
    phone: '+231-555-0103',
    coordinates: { lat: 6.3208, lng: -10.8172 },
    services: ['Emergency Care', 'Maternity', 'Surgery', 'Laboratory'],
    hours: '24/7 Emergency Services',
    type: 'hospital' as const,
    isActive: true
  },
  {
    name: 'GBV Support Center',
    address: 'Sinkor, Monrovia',
    phone: '+231-555-0104',
    coordinates: { lat: 6.3308, lng: -10.8272 },
    services: ['Crisis Counseling', 'Legal Support', 'Safe Shelter', 'Medical Care'],
    hours: '24/7 Hotline',
    type: 'emergency' as const,
    isActive: true
  },
  {
    name: 'Family Planning Clinic',
    address: 'Paynesville, Monrovia',
    phone: '+231-555-0105',
    coordinates: { lat: 6.3408, lng: -10.8372 },
    services: ['Contraception', 'Pregnancy Testing', 'STI Prevention', 'Health Education'],
    hours: 'Mon-Fri: 8AM-4PM',
    type: 'clinic' as const,
    isActive: true
  }
];

async function seedClinics() {
  try {
    console.log('🌱 Seeding clinics...');

    // Check if clinics already exist
    const existingClinics = await Clinic.count();
    if (existingClinics > 0) {
      console.log(`📋 Clinics already exist (${existingClinics} found). Skipping seed.`);
      return;
    }

    // Insert clinic data
    await Clinic.bulkCreate(clinicData);
    console.log(`✅ Successfully seeded ${clinicData.length} clinics`);

  } catch (error) {
    console.error('❌ Error seeding clinics:', error);
    throw error;
  }
}

async function runSeeds() {
  try {
    console.log('🚀 Starting database seeding...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run seeds
    await seedClinics();

    console.log('🎉 Database seeding completed successfully');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds, seedClinics };
