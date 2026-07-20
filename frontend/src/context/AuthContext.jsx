import { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken } from "../utils/token";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      
      setLoading(false);
      return;
    }

    setUser({ loggedIn: true });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
