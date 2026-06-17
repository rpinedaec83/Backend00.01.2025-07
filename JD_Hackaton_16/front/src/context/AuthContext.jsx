import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/me',{credentials:'include'})
      .then(r=>r.json())
      .then(d=> setUser(d.user))
      .finally(()=> setLoading(false));
  },[]);

  const loginGoogle = () => {
    window.location.href = import.meta.env.VITE_API_BASE_URL + '/api/auth/google';
  };
  const logout = async () => {
    await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/logout',{method:'POST',credentials:'include'});
    window.location.reload();
  };

  return <AuthCtx.Provider value={{ user, loading, loginGoogle, logout }}>
    {children}
  </AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);