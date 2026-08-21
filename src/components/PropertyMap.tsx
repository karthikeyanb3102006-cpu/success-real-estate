import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { formatPrice, type Listing } from "@/data/properties";
import { loadGoogleMaps, MAP_STYLE_LUXE } from "@/lib/google-maps";
import MapSearchBox from "./MapSearchBox";

type Props = {
  listings: Listing[];
  height?: string;
  zoom?: number;
  interactiveMarkers?: boolean;
  searchable?: boolean;
};

export default function PropertyMap({
  listings,
  height = "26rem",
  zoom = 11,
  interactiveMarkers = true,
  searchable = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;

        if (!mapRef.current) {
          mapRef.current = new maps.Map(ref.current, {
            zoom,
            center: { lat: listings[0]?.lat ?? 34.07, lng: listings[0]?.lng ?? -118.4 },
            styles: MAP_STYLE_LUXE,
            disableDefaultUI: true,
            zoomControl: true,
} as google.maps.MapOptions);
        }

        setReady(true);

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const bounds = new maps.LatLngBounds();
        listings.forEach((l) => {
          const position = { lat: l.lat, lng: l.lng };
          bounds.extend(position);
          const marker = new maps.Marker({
            position,
            map: mapRef.current!,
            title: `${l.title} — ${formatPrice(l)}`,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: "#D4AF37",
              fillOpacity: 1,
              strokeColor: "#0b0b0b",
              strokeWeight: 2,
            },
          });

          const info = new maps.InfoWindow({
            content: `<div style="font-family:system-ui;color:#111;min-width:150px">
              <strong>${l.title}</strong><br/>${l.city}<br/><span style="color:#8a6d1f">${formatPrice(l)}</span>
            </div>`,
          });
          marker.addListener("mouseover", () => info.open({ map: mapRef.current!, anchor: marker }));
          marker.addListener("mouseout", () => info.close());
          if (interactiveMarkers) {
            marker.addListener("click", () => {
              void navigate({ to: "/properties/$id", params: { id: l.id } });
            });
          }
          markersRef.current.push(marker);
        });

        if (listings.length > 1) {
          mapRef.current.fitBounds(bounds, 64);
        } else if (listings.length === 1) {
          mapRef.current.setCenter({ lat: listings[0]!.lat, lng: listings[0]!.lng });
          mapRef.current.setZoom(zoom);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [listings, zoom, interactiveMarkers, navigate]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-gold/40 bg-surface p-6 text-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  const focusLocation = ({ lat, lng, label }: { lat: number; lng: number; label: string }) => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    const maps = window.google.maps;
    const position = { lat, lng };
    searchMarkerRef.current?.setMap(null);
    searchMarkerRef.current = new maps.Marker({
      position,
      map,
      title: label,
      icon: {
        path: maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#D4AF37",
        strokeWeight: 2,
      },
    });
    map.panTo(position);
    map.setZoom(13);
  };

  const clearSearch = () => {
    searchMarkerRef.current?.setMap(null);
    searchMarkerRef.current = null;
  };

  return (
    <div className="relative w-full">
      {searchable && ready && <MapSearchBox onSelect={focusLocation} onClear={clearSearch} />}
      <div ref={ref} style={{ height }} className="w-full rounded-xl" />
    </div>
  );
}
