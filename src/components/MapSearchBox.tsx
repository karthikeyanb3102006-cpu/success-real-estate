import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type Suggestion = { text: string; placeId: string };

type Props = {
  onSelect: (place: { lat: number; lng: number; label: string }) => void;
  onClear?: () => void;
};

export default function MapSearchBox({ onSelect, onClear }: Props) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const places = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
        const { AutocompleteSuggestion, AutocompleteSessionToken } = places;
        sessionRef.current ??= new AutocompleteSessionToken();
        const { suggestions: res } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          sessionToken: sessionRef.current,
        });
        setSuggestions(
          res
            .map((s) => s.placePrediction)
            .filter((p): p is google.maps.places.PlacePrediction => Boolean(p))
            .slice(0, 5)
            .map((p) => ({ text: p.text.toString(), placeId: p.placeId })),
        );
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  const choose = async (s: Suggestion) => {
    setValue(s.text);
    setOpen(false);
    try {
      const places = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
      const place = new places.Place({ id: s.placeId });
      await place.fetchFields({ fields: ["location", "displayName", "formattedAddress"] });
      const loc = place.location;
      if (loc) onSelect({ lat: loc.lat(), lng: loc.lng(), label: s.text });
      sessionRef.current = null;
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="absolute left-3 top-3 z-10 w-[min(22rem,calc(100%-1.5rem))]">
      <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
        <Search className="h-4 w-4 text-gold" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder="Search a city, area or landmark"
          aria-label="Search location on map"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear location search"
            onClick={() => {
              setValue("");
              setSuggestions([]);
              setOpen(false);
              onClear?.();
            }}
            className="text-muted-foreground transition hover:text-gold"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="mt-1 overflow-hidden rounded-lg border border-gold/30 bg-background/98 shadow-xl backdrop-blur">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => void choose(s)}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-gold/10 hover:text-gold"
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
