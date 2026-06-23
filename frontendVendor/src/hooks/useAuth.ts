import { useState } from 'react';

interface AuthUser {
  name: string;
  email: string;
  company: string;
  role: string;
}

export function useAuth() {
  const [user] = useState<AuthUser>({
    name: 'Luxe Events Co.',
    email: 'vendor@eventhub360.com',
    company: 'Elite Catering & Event Design',
    role: 'Premium Vendor',
  });

  const isAuthenticated = !!localStorage.getItem('token');

  const login = (token: string) => {
    localStorage.setItem('token', token);
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return { user, isAuthenticated, login, logout };
}
