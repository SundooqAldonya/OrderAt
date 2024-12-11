export const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ saturation: 30 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#87CEEB" }, { lightness: 20 }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#98FB98" }, { lightness: 20 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#FFA07A" }, { lightness: 40 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#FFB6C1" }, { lightness: 50 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#F0FFF0" }, { lightness: 20 }],
  },
  {
    featureType: "poi.business",
    elementType: "geometry",
    stylers: [{ color: "#DDA0DD" }, { lightness: 30 }],
  },
];
