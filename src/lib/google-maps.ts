/// <reference types="google.maps" />

let loaderPromise: Promise<typeof google.maps> | null = null;

declare global {
  interface Window {
    __successMapsReady?: () => void;
  }
}


export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps require a browser"));
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
  const channel = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'];

  loaderPromise = new Promise((resolve, reject) => {
    if (!key) {
      reject(new Error("Google Maps key is not configured"));
      return;
    }
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }
    window.__successMapsReady = () => resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__successMapsReady${
      channel ? `&channel=${channel}` : ""
    }`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export const MAP_STYLE_LUXE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#121212" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#121212" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a8f76" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f1f1f" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6f6752" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b0b0b" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#161616" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
