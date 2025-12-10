import { sequelize } from '../config/database';
import { DataTypes, Model } from 'sequelize';

// Stakeholder Model (Admin, Police, SafeHouse, Medical, NGO)
export interface StakeholderAttributes {
  id?: number;
  role: 'ADMIN' | 'POLICE' | 'SAFEHOUSE' | 'MEDICAL' | 'NGO';
  secretCode: string;
  phoneNumber: string;
  surveyLink?: string;
  name?: string;
  organization?: string;
  email?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Stakeholder extends Model<StakeholderAttributes> implements StakeholderAttributes {
  public id!: number;
  public role!: 'ADMIN' | 'POLICE' | 'SAFEHOUSE' | 'MEDICAL' | 'NGO';
  public secretCode!: string;
  public phoneNumber!: string;
  public surveyLink?: string;
  public name?: string;
  public organization?: string;
  public email?: string;
  public isActive!: boolean;
  public lastLogin?: Date;
  public permissions!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Stakeholder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'),
      allowNull: false
    },
    secretCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surveyLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    sequelize,
    tableName: 'stakeholders',
    timestamps: true,
    underscored: true
  }
);

// Emergency Alert Model (shared across roles)
export interface EmergencyAlertAttributes {
  id?: number;
  userId?: number;
  stakeholderId?: number;
  alertType: 'panic' | 'medical' | 'gbv' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved' | 'cancelled';
  location: any;
  description: string;
  assignedTo?: number;
  assignedRole?: string;
  responseTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EmergencyAlert extends Model<EmergencyAlertAttributes> implements EmergencyAlertAttributes {
  public id!: number;
  public userId?: number;
  public stakeholderId?: number;
  public alertType!: 'panic' | 'medical' | 'gbv' | 'safety' | 'other';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public status!: 'active' | 'responding' | 'resolved' | 'cancelled';
  public location!: any;
  public description!: string;
  public assignedTo?: number;
  public assignedRole?: string;
  public responseTime?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmergencyAlert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    stakeholderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stakeholders',
        key: 'id'
      }
    },
    alertType: {
      type: DataTypes.ENUM('panic', 'medical', 'gbv', 'safety', 'other'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('active', 'responding', 'resolved', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assignedRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'emergency_alerts',
    timestamps: true,
    underscored: true
  }
);

// Case Management Model (Police, SafeHouse, Medical, NGO)
export interface CaseAttributes {
  id?: number;
  caseNumber: string;
  caseType: string;
  status: 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: number;
  assignedRole?: string;
  location: any;
  description: string;
  notes: any[];
  relatedAlerts: number[];
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Case extends Model<CaseAttributes> implements CaseAttributes {
  public id!: number;
  public caseNumber!: string;
  public caseType!: string;
  public status!: 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public assignedTo?: number;
  public assignedRole?: string;
  public location!: any;
  public description!: string;
  public notes!: any[];
  public relatedAlerts!: number[];
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Case.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    caseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    caseType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'investigating', 'in_progress', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assignedRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    relatedAlerts: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'cases',
    timestamps: true,
    underscored: true
  }
);

// Inter-Role Communication Model
export interface InterRoleMessageAttributes {
  id?: number;
  fromRole: string;
  fromStakeholderId: number;
  toRole: string;
  toStakeholderId?: number;
  messageType: 'alert' | 'request' | 'update' | 'notification' | 'data_share';
  subject: string;
  content: string;
  relatedCaseId?: number;
  relatedAlertId?: number;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt?: Date;
  updatedAt?: Date;
}

export class InterRoleMessage extends Model<InterRoleMessageAttributes> implements InterRoleMessageAttributes {
  public id!: number;
  public fromRole!: string;
  public fromStakeholderId!: number;
  public toRole!: string;
  public toStakeholderId?: number;
  public messageType!: 'alert' | 'request' | 'update' | 'notification' | 'data_share';
  public subject!: string;
  public content!: string;
  public relatedCaseId?: number;
  public relatedAlertId?: number;
  public isRead!: boolean;
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InterRoleMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fromRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromStakeholderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Stakeholder,
        key: 'id'
      }
    },
    toRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toStakeholderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Stakeholder,
        key: 'id'
      }
    },
    messageType: {
      type: DataTypes.ENUM('alert', 'request', 'update', 'notification', 'data_share'),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedCaseId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    relatedAlertId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    }
  },
  {
    sequelize,
    tableName: 'inter_role_messages',
    timestamps: true,
    underscored: true
  }
);

// Define relationships
Stakeholder.hasMany(EmergencyAlert, { foreignKey: 'stakeholderId', as: 'alerts' });
EmergencyAlert.belongsTo(Stakeholder, { foreignKey: 'stakeholderId', as: 'stakeholder' });

Stakeholder.hasMany(Case, { foreignKey: 'assignedTo', as: 'cases' });
Case.belongsTo(Stakeholder, { foreignKey: 'assignedTo', as: 'assignedStakeholder' });

Stakeholder.hasMany(InterRoleMessage, { foreignKey: 'fromStakeholderId', as: 'sentMessages' });
Stakeholder.hasMany(InterRoleMessage, { foreignKey: 'toStakeholderId', as: 'receivedMessages' });

// Export models (already exported above)

