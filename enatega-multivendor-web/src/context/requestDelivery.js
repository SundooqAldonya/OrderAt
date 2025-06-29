import React, { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  addressFrom: null,
  regionFrom: null,
  labelFrom: null,
  addressFreeTextFrom: null,
  addressTo: null,
  regionTo: null,
  labelTo: null,
  addressFreeTextTo: null,
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case "SET_ADDRESS_FROM":
      console.log({ action });
      localStorage.setItem(
        "addressFrom",
        JSON.stringify({ ...action.payload })
      );
      return {
        ...state,
        addressFrom: action.payload.addressFrom,
        regionFrom: action.payload.regionFrom,
        addressFreeTextFrom: action.payload.addressFreeTextFrom,
        labelFrom: action.payload.labelFrom,
      };
    case "SET_ADDRESS_TO":
      console.log({ action });
      localStorage.setItem("addressTo", JSON.stringify({ ...action.payload }));
      return {
        ...state,
        addressTo: action.payload.addressTo,
        regionTo: action.payload.regionTo,
        addressFreeTextTo: action.payload.addressFreeTextTo,
        labelTo: action.payload.labelTo,
      };
    default:
      return state;
  }
}

// Create context
const RequestDeliveryContext = createContext();

// Provider component
export function RequestDeliveryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setAddressFrom = (payload) => {
    dispatch({ type: "SET_ADDRESS_FROM", payload });
  };

  const setAddressTo = (payload) => {
    dispatch({ type: "SET_ADDRESS_TO", payload });
  };

  return (
    <RequestDeliveryContext.Provider
      value={{ state, setAddressFrom, setAddressTo }}
    >
      {children}
    </RequestDeliveryContext.Provider>
  );
}

// Custom hook to use the context
export function useRequestDelivery() {
  const context = useContext(RequestDeliveryContext);
  if (!context) {
    throw new Error(
      "useRequestDelivery must be used within a RequestDeliveryProvider"
    );
  }
  return context;
}
