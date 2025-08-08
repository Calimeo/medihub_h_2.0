// AuthContext.js
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Exemple de données user/hôpital connecté
  const [user, setUser] = useState({
    hospitalId: "642cbb1234567890abcdef12",
    // autres infos...
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
