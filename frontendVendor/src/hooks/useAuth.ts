export function useAuth() {
  const token = localStorage.getItem('token');
  const user = {
    name: localStorage.getItem('userName') ?? 'Vendor',
    email: localStorage.getItem('userEmail') ?? '',
    company: localStorage.getItem('businessName') ?? '',
    role: localStorage.getItem('userRole') ?? 'VENDOR',
    vendorId: localStorage.getItem('vendorId') ?? '',
    vendorStatus: localStorage.getItem('vendorStatus') ?? '',
  };

  const isAuthenticated = !!token;

  const login = (token: string) => {
    localStorage.setItem('token', token);
  };

  const logout = () => {
    localStorage.clear();
  };

  return { user, isAuthenticated, login, logout };
}
