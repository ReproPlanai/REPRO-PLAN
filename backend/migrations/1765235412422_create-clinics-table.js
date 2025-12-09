/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('clinics', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    address: {
      type: 'text',
      notNull: true
    },
    phone: {
      type: 'varchar(50)',
      notNull: false
    },
    email: {
      type: 'varchar(255)',
      notNull: false
    },
    coordinates: {
      type: 'jsonb',
      notNull: true
    },
    services: {
      type: 'text[]',
      notNull: true,
      default: '{}'
    },
    hours: {
      type: 'text',
      notNull: false
    },
    type: {
      type: 'varchar(50)',
      notNull: true,
      default: "'clinic'",
      check: "type IN ('clinic', 'hospital', 'counseling', 'emergency')"
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true
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

  // Create index on coordinates for spatial queries
  pgm.createIndex('clinics', 'coordinates', { method: 'gist' });

  // Create index on type for filtering
  pgm.createIndex('clinics', 'type');

  // Create index on is_active
  pgm.createIndex('clinics', 'is_active');
};

exports.down = pgm => {
  pgm.dropTable('clinics');
};
