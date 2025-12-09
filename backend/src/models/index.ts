import { sequelize } from '../config/database';
import { DataTypes, Model } from 'sequelize';

// User Model
export interface UserAttributes {
  id?: number;
  secretCode: string;
  surveyLink?: string; // Optional for maximum anonymity
  isVerified: boolean;
  isUsed: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Removed phoneNumber for anonymity
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public secretCode!: string;
  public surveyLink?: string; // Optional for anonymity
  // Removed phoneNumber for user anonymity
  public isVerified!: boolean;
  public isUsed!: boolean;
  public lastLogin?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    secretCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    surveyLink: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for maximum anonymity
      unique: false
    },
    // Anonymized - phone numbers removed for privacy
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

// Clinic Model
export interface ClinicAttributes {
  id?: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  coordinates: { lat: number; lng: number };
  services: string[];
  hours?: string;
  type: 'clinic' | 'hospital' | 'counseling' | 'emergency';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Clinic extends Model<ClinicAttributes> implements ClinicAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public phone?: string;
  public email?: string;
  public coordinates!: { lat: number; lng: number };
  public services!: string[];
  public hours?: string;
  public type!: 'clinic' | 'hospital' | 'counseling' | 'emergency';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Clinic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    hours: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('clinic', 'hospital', 'counseling', 'emergency'),
      allowNull: false,
      defaultValue: 'clinic'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'clinics',
    timestamps: true
  }
);

// Health Record Model
export interface HealthRecordAttributes {
  id?: number;
  userId: number;
  recordType: string;
  data: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class HealthRecord extends Model<HealthRecordAttributes> implements HealthRecordAttributes {
  public id!: number;
  public userId!: number;
  public recordType!: string;
  public data!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HealthRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    recordType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'health_records',
    timestamps: true
  }
);

// Define relationships
User.hasMany(HealthRecord, { foreignKey: 'userId', as: 'healthRecords' });
HealthRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export stakeholder models
export * from './stakeholders';

export { sequelize };

