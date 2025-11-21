import { sequelize } from '../config/database';
import { DataTypes, Model } from 'sequelize';

// User Model
export interface UserAttributes {
  id?: number;
  secretCode: string;
  surveyLink: string;
  phoneNumber?: string;
  isVerified: boolean;
  isUsed: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public secretCode!: string;
  public surveyLink!: string;
  public phoneNumber?: string;
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
      allowNull: false,
      unique: false // Multiple users can have same survey link
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
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

