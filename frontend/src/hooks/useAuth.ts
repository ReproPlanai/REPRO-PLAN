import { useState, useEffect } from 'react';

interface User {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for user data in localStorage or session
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData) as User;
          setAuthState({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'admin' || user.role === 'super_admin',
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
}
