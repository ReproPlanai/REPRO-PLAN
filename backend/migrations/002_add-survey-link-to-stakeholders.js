/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumn('stakeholders', {
    survey_link: {
      type: 'text',
      notNull: false
    }
  });

  // Add index for faster lookups
  pgm.createIndex('stakeholders', 'survey_link');
};

exports.down = pgm => {
  pgm.dropIndex('stakeholders', 'survey_link');
  pgm.dropColumn('stakeholders', 'survey_link');
};
