/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  console.log("user",user);

  return (
    <AppContext.Provider value={{ user,setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useContext(AppContext);
};

