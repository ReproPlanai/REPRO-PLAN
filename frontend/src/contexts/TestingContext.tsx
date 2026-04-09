import React, { createContext, useContext, useState, useCallback } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    userId?: string;
    route?: string;
    action?: string;
    userAgent?: string;
  };
}

interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface TestingContextType {
  // Error Handling
  errors: ErrorInfo[];
  addError: (error: Partial<ErrorInfo>) => void;
  clearErrors: () => void;
  clearError: (id: string) => void;
  
  // Validation
  validateForm: (data: Record<string, any>, rules: ValidationRule[]) => ValidationResult;
  validateEmail: (email: string) => boolean;
  validatePhone: (phone: string) => boolean;
  validateRequired: (value: any) => boolean;
  
  // Testing Utilities
  runHealthCheck: () => Promise<boolean>;
  testAPIConnectivity: () => Promise<boolean>;
  testLocalStorage: () => boolean;
  testSpeechSynthesis: () => boolean;
  
  // Performance Monitoring
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
  };
  recordPerformanceMetric: (metric: 'pageLoadTime' | 'apiResponseTime' | 'memoryUsage', value: number) => void;
}

const TestingContext = createContext<TestingContextType | null>(null);

export const useTesting = () => {
  const context = useContext(TestingContext);
  if (!context) {
    throw new Error('useTesting must be used within TestingProvider');
  }
  return context;
};

export const TestingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0
  });

  // Error Handling
  const addError = useCallback((error: Partial<ErrorInfo>) => {
    const newError: ErrorInfo = {
      id: Date.now().toString(),
      message: error.message || 'Unknown error occurred',
      timestamp: new Date(),
      severity: error.severity || 'medium',
      stack: error.stack,
      componentStack: error.componentStack,
      context: {
        userId: localStorage.getItem('userId') || undefined,
        route: window.location.pathname,
        userAgent: navigator.userAgent,
        ...error.context
      }
    };

    setErrors(prev => [...prev, newError]);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', newError);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // Validation Functions
  const validateRequired = useCallback((value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }, []);

  const validateForm = useCallback((data: Record<string, any>, rules: ValidationRule[]): ValidationResult => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = data[rule.field];

      // Required validation
      if (rule.required && !validateRequired(value)) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) continue;

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors[rule.field] = `${rule.field} must not exceed ${rule.maxLength} characters`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[rule.field] = `${rule.field} format is invalid`;
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors[rule.field] = customError;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateRequired]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }, []);

  // Performance Monitoring
  const recordPerformanceMetric = useCallback((metric: 'pageLoadTime' | 'apiResponseTime' | 'memoryUsage', value: number) => {
    setPerformanceMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid phone number (10-15 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }, []);

  // Testing Utilities
  const testAPIConnectivity = useCallback(async (): Promise<boolean> => {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const responseTime = performance.now() - startTime;
      recordPerformanceMetric('apiResponseTime', responseTime);
      return response.ok;
    } catch (error) {
      recordPerformanceMetric('apiResponseTime', performance.now() - startTime);
      return false;
    }
  }, [recordPerformanceMetric]);

  const testLocalStorage = useCallback((): boolean => {
    try {
      const testKey = 'test_local_storage';
      const testValue = 'test_value';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      return false;
    }
  }, []);

  const testSpeechSynthesis = useCallback((): boolean => {
    try {
      return 'speechSynthesis' in window && 
             typeof window.speechSynthesis.getVoices === 'function';
    } catch (error) {
      return false;
    }
  }, []);

  const runHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const results = await Promise.allSettled([
        testAPIConnectivity(),
        Promise.resolve(testLocalStorage()),
        Promise.resolve(testSpeechSynthesis())
      ]);

      const allPassed = results.every(result => 
        result.status === 'fulfilled' && result.value === true
      );

      if (!allPassed) {
        addError({
          message: 'Health check failed - some services are unavailable',
          severity: 'medium',
          context: { action: 'health_check' }
        });
      }

      return allPassed;
    } catch (error) {
      addError({
        message: `Health check error: ${error}`,
        severity: 'high',
        context: { action: 'health_check' }
      });
      return false;
    }
  }, [testAPIConnectivity, testLocalStorage, testSpeechSynthesis, addError]);

  // Initialize performance monitoring
  React.useEffect(() => {
    // Measure page load time
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      recordPerformanceMetric('pageLoadTime', loadTime);
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100;
      recordPerformanceMetric('memoryUsage', memoryUsage);
    }

    // Run initial health check
    runHealthCheck();
  }, [recordPerformanceMetric, runHealthCheck]);

  // Global error handler
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        context: { action: 'javascript_error' }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError({
        message: `Unhandled promise rejection: ${event.reason}`,
        severity: 'high',
        context: { action: 'promise_rejection' }
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addError]);

  const value: TestingContextType = {
    errors,
    addError,
    clearErrors,
    clearError,
    validateForm,
    validateEmail,
    validatePhone,
    validateRequired,
    runHealthCheck,
    testAPIConnectivity,
    testLocalStorage,
    testSpeechSynthesis,
    performanceMetrics,
    recordPerformanceMetric
  };

  return (
    <TestingContext.Provider value={value}>
      {children}
    </TestingContext.Provider>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => {
  return null;
};

// Form validation hook
export const useFormValidation = (initialValues: Record<string, any>, rules: ValidationRule[]) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateForm } = useTesting();

  const setValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const result = validateForm(values, rules);
    setErrors(result.errors);
    return result.isValid;
  }, [values, rules, validateForm]);

  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, any>) => Promise<void>) => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validate,
    handleSubmit
  };
};
