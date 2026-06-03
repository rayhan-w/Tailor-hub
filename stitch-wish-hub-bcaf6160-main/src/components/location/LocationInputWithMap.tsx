import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

// Leaflet default marker fix for bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type NominatimReverseResponse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

type NominatimSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimReverseResponse["address"];
};

function getBestPlaceLabel(data: NominatimReverseResponse | null, fallback: string) {
  const addr = data?.address;
  return (
    addr?.city ||
    addr?.town ||
    addr?.village ||
    addr?.suburb ||
    data?.display_name ||
    fallback
  );
}

interface LocationInputWithMapProps {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  className?: string;
  onPickCoordinates?: (lat: number, lng: number, label: string) => void;
}

export default function LocationInputWithMap({
  value,
  onChange,
  placeholder,
  className,
  onPickCoordinates,
}: LocationInputWithMapProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lat, setLat] = useState(23.8103);
  const [lng, setLng] = useState(90.4125);
  const [reverse, setReverse] = useState<NominatimReverseResponse | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const ignoreNextMapClickRef = useRef(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<NominatimSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const suppressNextSearchRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const coordsLabel = useMemo(() => `${lat.toFixed(4)}, ${lng.toFixed(4)}`, [lat, lng]);
  const displayLabel = useMemo(() => getBestPlaceLabel(reverse, coordsLabel), [reverse, coordsLabel]);

  const reverseGeocode = async (nextLat: number, nextLng: number) => {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(nextLat));
      url.searchParams.set("lon", String(nextLng));
      url.searchParams.set("zoom", "12");
      url.searchParams.set("addressdetails", "1");

      // Best-effort language hint
      url.searchParams.set("accept-language", language === "bn" ? "bn" : "en");

      const res = await fetch(url.toString());
      if (!res.ok) return;
      const json = (await res.json()) as NominatimReverseResponse;
      setReverse(json);
    } catch {
      // ignore
    }
  };

  const pick = async (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
    setReverse(null);
    await reverseGeocode(nextLat, nextLng);
  };

  const handleUseCurrent = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Avoid treating this state update as a map click
        ignoreNextMapClickRef.current = true;
        void pick(pos.coords.latitude, pos.coords.longitude);
        setIsLoading(false);
      },
      () => setIsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onChange(displayLabel);
    onPickCoordinates?.(lat, lng, displayLabel);
    setOpen(false);
  };

  // Debounced forward-geocoding (search by place name)
  useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    const q = value?.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("q", q);
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "6");
        url.searchParams.set("accept-language", language === "bn" ? "bn" : "en");

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) return;
        const json = (await res.json()) as NominatimSearchResult[];
        setSuggestions(json);
        setShowSuggestions(true);
      } catch {
        // ignore (likely abort)
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value, language]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelectSuggestion = (s: NominatimSearchResult) => {
    const nextLat = parseFloat(s.lat);
    const nextLng = parseFloat(s.lon);
    const label =
      s.address?.city ||
      s.address?.town ||
      s.address?.village ||
      s.address?.suburb ||
      s.display_name.split(",")[0];

    suppressNextSearchRef.current = true;
    onChange(label);
    setLat(nextLat);
    setLng(nextLng);
    setShowSuggestions(false);
    setSuggestions([]);
    onPickCoordinates?.(nextLat, nextLng, label);
  };

  // Init / refresh Leaflet map when dialog opens
  useEffect(() => {
    if (!open) return;

    // Let Dialog fully render and animate before initializing the map
    const id = window.setTimeout(() => {
      const el = mapContainerRef.current;
      if (!el) return;

      if (!mapRef.current) {
        const map = L.map(el, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;
        mapRef.current = map;

        map.on("click", (e: L.LeafletMouseEvent) => {
          if (ignoreNextMapClickRef.current) {
            ignoreNextMapClickRef.current = false;
            return;
          }
          void pick(e.latlng.lat, e.latlng.lng);
        });

        // Extra invalidateSize after tiles start loading
        setTimeout(() => map.invalidateSize(), 300);
      }

      // Ensure tiles render correctly inside a dialog
      mapRef.current.invalidateSize();
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 13));
      markerRef.current?.setLatLng([lat, lng]);
    }, 200);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep marker + viewport in sync with selected coordinates
  useEffect(() => {
    if (!mapRef.current) return;
    markerRef.current?.setLatLng([lat, lng]);
    // Only fly if map is open (prevents jumps while closed)
    if (open) {
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 13));
    }
  }, [lat, lng, open]);

  // Cleanup
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <MapPin
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={t("selectOnMap")}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen(true);
          }}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          className={"pl-10 pr-10 " + (className || "")}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setOpen(true)}
          aria-label={t("selectOnMap")}
        >
          <MapPin className="h-4 w-4" />
        </Button>

        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-72 overflow-auto">
            {isSearching && suggestions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {t("loading")}
              </div>
            )}
            {suggestions.map((s) => (
              <button
                type="button"
                key={s.place_id}
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("selectOnMap")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative w-full h-80 rounded-lg overflow-hidden border border-border">
              <div ref={mapContainerRef} className="h-full w-full" />
              <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs z-[1000]">
                {displayLabel}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrent}
                disabled={isLoading}
                className="gap-2"
              >
                <Navigation className="h-4 w-4" />
                {isLoading ? t("loading") : t("useCurrentLocation")}
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="button" onClick={handleConfirm}>
                  {t("save")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
