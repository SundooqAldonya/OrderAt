import React, { createContext, useState } from 'react'

// Create a context
export const AreaContext = createContext()
const AreaProvider = ({ children }) => {
  const [areas, setAreas] = useState()

  return (
    <AreaContext.Provider value={{ areas, setAreas }}>
      {children}
    </AreaContext.Provider>
  )
}
export default AreaProvider
