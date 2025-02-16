import React, { createContext, useState } from "react";

export const ExpandContext = createContext();

export const ExpandProvider = ({ children }) => {
  const [expand, setExpand] = useState(false);

  return (
    <ExpandContext.Provider value={{ expand, setExpand }}>
      {children}
    </ExpandContext.Provider>
  );
};
