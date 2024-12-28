/* eslint-disable react-hooks/exhaustive-deps */
import Geocode from "react-geocode";
import ConfigurableValues from "../config/constants";

export default function useLocation() {
  const { GOOGLE_MAPS_KEY } = ConfigurableValues();
  const DEFAULT_LAT = 31.1106593; // Kafr El-Shaikh coordinates
  const DEFAULT_LNG = 30.9387799;

  Geocode.setApiKey(GOOGLE_MAPS_KEY);
  Geocode.setLanguage("en");
  Geocode.enableDebug(false);

  const latLngToGeoString = async ({ latitude, longitude }) => {
    try {
      const location = await Geocode.fromLatLng(latitude, longitude);
      return location.results[0].formatted_address;
    } catch (error) {
      console.error("Error in latLngToGeoString:", error);
      return "Kafr El-Shaikh, Egypt"; // Default address if geocoding fails
    }
  };

  const getCurrentLocation = (callback) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const location = await Geocode.fromLatLng(latitude, longitude);
          callback(null, {
            label: "Home",
            latitude,
            longitude,
            deliveryAddress: location.results[0].formatted_address,
          });
        } catch (error) {
          // Fallback to default location if there's an error
          callback(null, {
            label: "Home",
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG,
            deliveryAddress: "Kafr El-Shaikh, Egypt",
          });
        }
      },
      (error) => {
        // Fallback to default location if geolocation fails
        callback(null, {
          label: "Home",
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          deliveryAddress: "Kafr El-Shaikh, Egypt",
        });
      }
    );
  };

  return {
    getCurrentLocation,
    latLngToGeoString,
  };
}
