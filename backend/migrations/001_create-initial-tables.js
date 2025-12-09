/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create users table
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    secret_code: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    survey_link: {
      type: 'text',
      notNull: true
    },
    phone_number: {
      type: 'varchar(50)',
      notNull: false
    },
    is_verified: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    is_used: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    last_login: {
      type: 'timestamp',
      notNull: false
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create stakeholders table
  pgm.createTable('stakeholders', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    role: {
      type: 'varchar(50)',
      notNull: true,
      check: "role IN ('ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO')"
    },
    secret_code: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    phone_number: {
      type: 'varchar(50)',
      notNull: true
    },
    name: {
      type: 'varchar(255)',
      notNull: false
    },
    organization: {
      type: 'varchar(255)',
      notNull: false
    },
    email: {
      type: 'varchar(255)',
      notNull: false
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true
    },
    last_login: {
      type: 'timestamp',
      notNull: false
    },
    permissions: {
      type: 'jsonb',
      notNull: true,
      default: "'{}'"
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create emergency_alerts table
  pgm.createTable('emergency_alerts', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    user_id: {
      type: 'integer',
      notNull: false,
      references: 'users',
      onDelete: 'SET NULL'
    },
    stakeholder_id: {
      type: 'integer',
      notNull: false,
      references: 'stakeholders',
      onDelete: 'SET NULL'
    },
    alert_type: {
      type: 'varchar(50)',
      notNull: true,
      check: "alert_type IN ('panic', 'medical', 'gbv', 'safety', 'other')"
    },
    priority: {
      type: 'varchar(50)',
      notNull: true,
      default: "'medium'",
      check: "priority IN ('low', 'medium', 'high', 'critical')"
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: "'active'",
      check: "status IN ('active', 'responding', 'resolved', 'cancelled')"
    },
    location: {
      type: 'jsonb',
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    assigned_to: {
      type: 'integer',
      notNull: false,
      references: 'stakeholders',
      onDelete: 'SET NULL'
    },
    assigned_role: {
      type: 'varchar(50)',
      notNull: false
    },
    response_time: {
      type: 'integer',
      notNull: false
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create cases table
  pgm.createTable('cases', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    case_number: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    case_type: {
      type: 'varchar(255)',
      notNull: true
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: "'open'",
      check: "status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed')"
    },
    priority: {
      type: 'varchar(50)',
      notNull: true,
      default: "'medium'",
      check: "priority IN ('low', 'medium', 'high', 'critical')"
    },
    assigned_to: {
      type: 'integer',
      notNull: false,
      references: 'stakeholders',
      onDelete: 'SET NULL'
    },
    assigned_role: {
      type: 'varchar(50)',
      notNull: false
    },
    location: {
      type: 'jsonb',
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    notes: {
      type: 'jsonb',
      notNull: true,
      default: "'[]'"
    },
    related_alerts: {
      type: 'integer[]',
      notNull: true,
      default: "'{}'"
    },
    created_by: {
      type: 'integer',
      notNull: false,
      references: 'stakeholders',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create inter_role_messages table
  pgm.createTable('inter_role_messages', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    from_role: {
      type: 'varchar(50)',
      notNull: true
    },
    from_stakeholder_id: {
      type: 'integer',
      notNull: true,
      references: 'stakeholders',
      onDelete: 'CASCADE'
    },
    to_role: {
      type: 'varchar(50)',
      notNull: true
    },
    to_stakeholder_id: {
      type: 'integer',
      notNull: false,
      references: 'stakeholders',
      onDelete: 'SET NULL'
    },
    message_type: {
      type: 'varchar(50)',
      notNull: true,
      check: "message_type IN ('alert', 'request', 'update', 'notification', 'data_share')"
    },
    subject: {
      type: 'varchar(255)',
      notNull: true
    },
    content: {
      type: 'text',
      notNull: true
    },
    related_case_id: {
      type: 'integer',
      notNull: false,
      references: 'cases',
      onDelete: 'SET NULL'
    },
    related_alert_id: {
      type: 'integer',
      notNull: false,
      references: 'emergency_alerts',
      onDelete: 'SET NULL'
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    priority: {
      type: 'varchar(50)',
      notNull: true,
      default: "'medium'",
      check: "priority IN ('low', 'medium', 'high', 'critical')"
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create health_records table
  pgm.createTable('health_records', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE'
    },
    record_type: {
      type: 'varchar(255)',
      notNull: true
    },
    data: {
      type: 'jsonb',
      notNull: true
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });

  // Create indexes for performance
  pgm.createIndex('users', 'secret_code');
  pgm.createIndex('users', 'survey_link');
  pgm.createIndex('stakeholders', 'secret_code');
  pgm.createIndex('stakeholders', 'role');
  pgm.createIndex('stakeholders', 'is_active');
  pgm.createIndex('emergency_alerts', 'alert_type');
  pgm.createIndex('emergency_alerts', 'status');
  pgm.createIndex('emergency_alerts', 'priority');
  pgm.createIndex('emergency_alerts', 'location', { method: 'gist' });
  pgm.createIndex('cases', 'case_number');
  pgm.createIndex('cases', 'status');
  pgm.createIndex('cases', 'priority');
  pgm.createIndex('inter_role_messages', 'from_role');
  pgm.createIndex('inter_role_messages', 'to_role');
  pgm.createIndex('inter_role_messages', 'is_read');
  pgm.createIndex('inter_role_messages', 'message_type');
  pgm.createIndex('health_records', 'user_id');
  pgm.createIndex('health_records', 'record_type');
};

exports.down = pgm => {
  pgm.dropTable('health_records');
  pgm.dropTable('inter_role_messages');
  pgm.dropTable('cases');
  pgm.dropTable('emergency_alerts');
  pgm.dropTable('stakeholders');
  pgm.dropTable('users');
};
