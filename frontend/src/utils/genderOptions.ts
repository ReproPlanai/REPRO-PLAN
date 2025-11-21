// Standardized gender options for forms across the app
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
] as const;

export type GenderType = typeof GENDER_OPTIONS[number]['value'];

// Helper function to get gender label from value
export const getGenderLabel = (value: GenderType): string => {
  const option = GENDER_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Validate if a gender value is valid
export const isValidGender = (value: string): value is GenderType => {
  return GENDER_OPTIONS.some(option => option.value === value);
};
